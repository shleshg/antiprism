const db = require('../db');
const WsProvider = require('./provider');
const assert = require('assert').strict;

class WsModel extends db.DatabaseModel {
	constructor(provider, model) {
		super(provider, model);
		assert.ok(provider instanceof WsProvider)
	}
	static async getModels(provider, fields, where, group, sort) {
		assert.ok(false, 'unimplemented get models');
	}
	async update(sets) {
		assert.ok(false, 'unimplemented update');
	}
	async delete() {
		assert.ok(false, 'unimplemented delete');
	}
	identWhereParams() {
		assert(false, 'unimplemented ident where params');
	}
	applySets() {
		assert(false, 'unimplemented apply sets');
	}
}

module.exports = WsModel;