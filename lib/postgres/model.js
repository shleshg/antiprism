const db = require('../db');
const params = require('./params');
const PostgresProvider = require('./provider');
const assert = require('assert').strict;

class PostgresModel extends db.DatabaseModel {
	constructor(provider, model) {
		super(provider, model);
		assert.ok(provider instanceof PostgresProvider)
	}
	static getModels(provider, fields, where, group, sort) {
		assert.ok(false, 'unimplemented get models');
	}
	update(sets) {
		assert.ok(false, 'unimplemented update');
	}
	delete() {
		assert.ok(false, 'unimplemented delete');
	}
}

module.exports = PostgresModel;