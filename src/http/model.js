const db = require('../db');
const HttpProvider = require('./provider');
const assert = require('assert').strict.ok;

class HttpModel extends db.DatabaseModel {
	constructor(provider, model) {
		super(provider, model);
		assert(provider instanceof HttpProvider)
	}
	static async getModels(provider, fields, where, group, sort) {
		assert(false, 'unimplemented get models');
	}
	async update(sets) {
		assert(false, 'unimplemented update');
	}
	async delete() {
		assert(false, 'unimplemented delete');
	}
}

module.exports = HttpModel;