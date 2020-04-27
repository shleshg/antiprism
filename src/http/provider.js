const db = require('../db');
const PostData = require('./post');

class HttpProvider extends db.DatabaseProvider {
	constructor(user, password, database, port, models, url) {
		super(models);
		this.url = url;
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

	async exec(method, model, data) {
		return PostData(this.url, method, {model: model, data: data});
	}
}

module.exports = HttpProvider;