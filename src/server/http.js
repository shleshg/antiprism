const express = require('express');
const db = require('../db');

class HttpServer {
	constructor(url, provider) {
		this.url = url;
		this.app = express();
		this.app.use(express.json());
		this.app.use(express.static('frontend'));
		const wsApp = require('express-ws')(this.app);
		const subs = new Map();
		const models = [];
		for (const prop in provider._models) {
			models.push(prop);
		}
		models.forEach(m => {
			subs.set(m, []);
		});
		const insertConnection = (model, ws, subId) => {
			const set = subs.get(model);
			for (let i = 0; i < set.length; i++) {
				if (set[i] === null) {
					set[i] = {
						id: subId,
						conn: ws
					};
					return i;
				}
			}
			return set.push({
				id: subId,
				conn: ws
			}) - 1;
		};
		const dropConnection = (model, ind) => {
			const set = subs.get(model);
			set[ind] = null;
		};
		const emitMessages = (model, event, data) => {
			const set = subs.get(model);
			set.filter(s => s !== null).forEach(s => {
				s.conn.send(JSON.stringify({
					method: 'event',
					id: s.id,
					data: {
						model: model,
						data: {
							method: event,
							data: data
						}
					}
				}))
			});
		};
		this.app.ws('/connect', async (ws, req) => {
			const clientSubs = new Map();
			console.log(models);
			models.forEach(m => {
				clientSubs.set(m, null);
			});
			ws.on('open', () => {
				console.log('open connection');
			});
			ws.on('message', (msg) => {
				const data = JSON.parse(msg);
				console.log(data);
				const resp = {
					method: data.method,
					id: data.id,
					result: null,
					error: null
				};
				if (data.method === 'subscribe') {
					console.log('sub!', clientSubs.get(data.data.model));
					if (clientSubs.get(data.data.model) !== null) {
						resp.error = {
							code: 400,
							message: 'subscription exists'
						};
					} else {
						const ind = insertConnection(data.data.model, ws, data.data.data.id);
						clientSubs.set(data.data.model, {id: data.data.data.id, ind: ind});
						resp.result = {
							success: true
						};
					}
				} else if (data.method === 'unsubscribe') {
					let model = null, ind = null;
					clientSubs.forEach((v, k) => {
						if (v && v.id === data.data.data.id) {
							model = k;
							ind = v.ind;
						}
					});
					if (model === null) {
						resp.error = {
							code: 400,
							message: 'subscription doesn\'t exist'
						};
					} else {
						dropConnection(model, ind);
						clientSubs.set(model, null);
						resp.result = {
							success: true
						}
					}
				} else if (data.method === 'ping') {
					resp.result = 'pong';
				} else {
					resp.error = {
						code: 400,
						message: 'unknown method'
					};
				}
				ws.send(JSON.stringify(resp));
			});
			ws.on('close', () => {
				clientSubs.forEach((v, k) => {
					if (v) {
						dropConnection(k, v.ind);
					}
				});
				console.log('close connection');
			});
		});
		this.app.post(this.url, async (req, res) => {
			const body = req.body;
			const method = body.method;
			const resp = {
				method: method,
				id: body.id,
				result: null,
				error: null
			};
			if (method === 'insert') {
				const sets = body.data.sets.map(s => new db.SetParameter(provider, s));
				resp.result = await provider.insertModel(body.data.model, sets);
				emitMessages(body.data.model, 'insert', body.data);
			} else if (method === 'get') {
				const fields = body.data.fields.map(f => new db.GetParameter(provider, f));
				const where = body.data.where ? new db.WhereCondition(provider, body.data.where) : null;
				const group = body.data.group.map(g => new db.GroupingParameter(provider, g));
				const sort = body.data.sort.map(s => new db.SortParameter(provider, s));
				resp.result = await provider.getModels(body.data.model, fields, where, group, sort);
			} else if (method === 'update') {
				const sets = body.data.sets.map(s => new db.SetParameter(provider, s));
				const where = body.data.where ? new db.WhereCondition(provider, body.data.where) : null;
				resp.result = await provider.updateModels(body.data.model, sets, where);
				emitMessages(body.data.model, 'update', body.data);
			} else if (method === 'delete') {
				console.log(body);
				const where = body.data.where ? new db.WhereCondition(provider, body.data.where) : null;
				resp.result = await provider.deleteModels(body.data.model, where);
				emitMessages(body.data.model, 'delete', body.data);
			} else if (method === 'ping') {
				resp.result = 'pong';
			} else {
				resp.error = {
					code: 400,
					message: 'unknown method'
				}
			}
			res.status(200).json(resp);
		});
		this.app.listen(8030);
	}
}

module.exports = HttpServer;