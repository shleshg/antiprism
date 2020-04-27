const db = require('../db');

let id = 0;
let subId = 0;

class WsProvider extends db.DatabaseProvider {
	constructor(user, password, database, port, models, url) {
		super(models);
		this.url = url;
		this.opened = false;
		this.callbacks = new Map();
		this.subCallbacks = new Map();
		this.initConnection();
	}

	initConnection() {
		this.connection = new WebSocket(this.url);
		this.connection.onopen = this.onopen.bind(this);
		this.connection.onclose = this.onclose.bind(this);
		this.connection.onerror = this.onerror.bind(this);
		this.connection.onmessage = (msg) => {
			const res = JSON.parse(msg.data);
			if (res.method === 'subUpdate') {
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
		this.opened = true;
	}

	onclose() {
		this.opened = false;
		this.initConnection();
	}

	onerror(err) {
		console.log('ws err', err);
	}

	connect() {

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
		return this.exec('get', model, {fields: fields, where: where, group: group, sort: sort});
	}

	async updateModels(model, sets, where) {
		if (!this.validateSets(model, sets)) {
			throw new Error('invalid params');
		}
		return this.exec('update', model, {sets: sets});
	}

	async deleteModels(model, where) {
		return this.exec('delete', model, {where: where});
	}

	async subscribeModels(model, callback) {
		const idToSub = ++subId;
		this.subCallbacks.set(idToSub, callback);
		return this.exec('subscribe', model, {id: idToSub});
	}

	async exec(method, model, data) {
		if (!this.opened) {
			console.log('socket not opened');
			return null;
		}
		const requestId = ++id;
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
