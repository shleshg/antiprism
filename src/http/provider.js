const db = require('../db');
const PostData = require('./post').PostData;

class HttpProvider extends db.DatabaseProvider {
	constructor(user, password, database, port, models) {
		super(models);
		this.url = '/api/antiprism';
	}

	connect() {
		return this.exec('ping', null, null);
	}

	disconnect() {
		return true;
	}

	async insertModel(model, sets) {
		if (!this.validateSets(model, sets)) {
			throw new Error('invalid params');
		}
		const res = await this.exec('insert', {model: model, sets: sets.map(s => s.toObject())});
		return res.result;
	}

	async getModels(model, fields, where, group, sort) {
		if (!this.validateGets(model, fields)) {
			throw new Error('invalid params');
		}
		if (where && !this.validateWhereParameter(model, where.opType, where.op, where.args)) {
			throw new Error('invalid where');
		}
		where = where ? where.toObject() : null;
		const res = await this.exec('get', {model: model, fields: fields, where: where, group: group, sort: sort});
		return res.result;
	}

	async updateModels(model, sets, where) {
		if (!this.validateSets(model, sets)) {
			throw new Error('invalid params');
		}
		if (where && !this.validateWhereParameter(model, where.opType, where.op, where.args)) {
			throw new Error('invalid where');
		}
		where = where ? where.toObject() : null;
		const res = await this.exec('update', {model: model, where: where, sets: sets.map(s => s.toObject())});
		return res.result;
	}

	async deleteModels(model, where) {
		if (where && !this.validateWhereParameter(model, where.opType, where.op, where.args)) {
			throw new Error('invalid where');
		}
		where = where ? where.toObject() : null;
		const res = await this.exec('delete', {model: model, where: where});
		return res.result;
	}

	async exec(method, data) {
		return PostData(this.url, method, data);
	}
}

module.exports = HttpProvider;