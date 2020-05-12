const db = require('../db');

let wsId = 0;
let subId = 0;

class WsProvider extends db.DatabaseProvider {
	constructor(user, password, database, port, models, url) {
		super(models);
		this.url = 'ws://' + document.location.host + '/connect';
		this.opened = false;
		this.callbacks = new Map();
		this.subCallbacks = new Map();
	}

	initConnection() {
		console.log('init conn');
		this.connection = new WebSocket(this.url);
		this.connection.onopen = this.onopen.bind(this);
		this.connection.onclose = this.onclose.bind(this);
		this.connection.onerror = this.onerror.bind(this);
		this.connection.onmessage = (msg) => {
			const res = JSON.parse(msg.data);
			console.log(res);
			if (res.method === 'event') {
				if (!this.subCallbacks.has(res.id)) {
					console.log('unknown sub id', res);
					return;
				}
				this.subCallbacks.get(res.id)(res.data);
				return;
			}
			if (!this.callbacks.has(res.id)) {
				console.log('unknown id', res);
				return;
			}
			this.callbacks.get(res.id)(res);
		};
	}

	onopen() {
		console.log('open conn');
		this.opened = true;
	}

	onclose() {
		console.log('close conn');
		this.opened = false;
		this.initConnection();
	}

	onerror(err) {
		console.log('ws err', err);
		// setTimeout(this.initConnection.bind(this), 300);
	}

	connect() {
		this.initConnection();
	}

	disconnect() {
		this.connection.close();
	}

	async insertModel(model, sets) {
		if (!this.validateSets(model, sets)) {
			throw new Error('invalid params');
		}
		return this.exec('insert', model, {sets: sets.map(s => s.toObject())});
	}

	async getModels(model, fields, where, group, sort) {
		if (!this.validateGets(model, fields)) {
			throw new Error('invalid params');
		}
		fields = fields.map(f => {
			if (f instanceof db.GetParameter) {
				return f.toObject();
			} else {
				return {
					name: f
				}
			}
		});
		if (where && !this.validateWhereParameter(model, where.opType, where.op, where.args)) {
			throw new Error('invalid where');
		}
		where = where ? where.toObject() : null;
		if (group && !this.validateGroupings(model, group)) {
			throw new Error('invalid group');
		}
		if (sort && !this.validateSorts(model, sort)) {
			throw new Error('invalid sort');
		}
		return this.exec('get', model, {fields: fields, where: where, group: group.map(g => g.toObject()), sort: sort.map(s => s.toObject())});
	}

	async updateModels(model, sets, where) {
		if (!this.validateSets(model, sets)) {
			throw new Error('invalid params');
		}
		if (where && !this.validateWhereParameter(model, where.opType, where.op, where.args)) {
			throw new Error('invalid where');
		}
		where = where ? where.toObject() : null;
		return this.exec('update', model, {where: where, sets: sets.map(s => s.toObject())});
	}

	async deleteModels(model, where) {
		if (where && !this.validateWhereParameter(model, where.opType, where.op, where.args)) {
			throw new Error('invalid where');
		}
		where = where ? where.toObject() : null;
		return this.exec('delete', model, {where: where});
	}

	async subscribeModels(model, callback) {
		const idToSub = ++subId;
		this.subCallbacks.set(idToSub, callback);
		await this.exec('subscribe', model, {id: idToSub});
		return idToSub;
	}

	async unsubscribeModels(model, id) {
		await this.exec('unsubscribe', model, {id: id});
		this.subCallbacks.set(id, null);
	}

	async exec(method, model, data) {
		if (!this.opened) {
			console.log('socket not opened');
			return null;
		}
		const requestId = ++wsId;
		const callbackWait = new Promise((resolve, reject) => {
			this.callbacks.set(requestId, (res) => {
				resolve(res);
			})
		});
		this.connection.send(JSON.stringify({
			method: method,
			id: requestId,
			data: {
				model: model,
				data: data
			}
		}));
		await callbackWait;
	}
}

module.exports = WsProvider;