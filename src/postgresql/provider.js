const db = require('../db');
const { Client } = require('pg');

const types = {
	'int': 'integer',
	'float': 'real',
	'datetime': 'timestamp',
	'string': 'string',
	'boolean': 'boolean'
};

class PostgresqlProvider extends db.DatabaseProvider {
	constructor(user, password, database, port, models) {
		super(models);
		console.log(user, password, database, port, models);
		this._config = {};
		if (user) {
			this._config.user = user;
		}
		if (password) {
			this._config.password = password;
		}
		if (database) {
			this._config.database = database;
		}
		if (port) {
			this._config.port = port;
		}
		this.client = new Client(this._config);
	}

	connect() {
		return this.client.connect();
	}

	disconnect() {
		return this.client.end();
	}

	async insertModel(model, sets) {
		if (!this.validateSets(model, sets)) {
			throw new Error('invalid params');
		}
		const cmd = 'insert into ' + model + '(' + sets.map(f => f.name) + ')' + ' values(' + sets.map((value, index) => '$' + (index+1).toString()) + ');';
		console.log(cmd);
		return this.exec(cmd, sets.map(f => f.value));
	}

	async getModels(model, fields, where, group, sort) {
		if (!this.validateGets(model, fields)) {
			throw new Error('invalid params');
		}
		const cmd = 'select ' + fields.map(f => typeof f === 'string' ? f : f.name).join(',') + ' from ' + model + ';';
		console.log(cmd);
		const res = await this.exec(cmd, []);
		return res.rows;
	}

	async updateModels(model, sets, where) {
		if (!this.validateSets(model, sets)) {
			throw new Error('invalid params');
		}
		const cmd = 'update ' + model + ' set ' + sets.map((s, index) => s.name + ' = $'+(index+1).toString()).join(',') + ' ;';
		console.log(cmd);
		return this.exec(cmd, sets.map(s => s.value));
	}

	async deleteModels(model, where) {
		let cmd = 'delete from ' + model + ' ;';
		console.log(cmd);
		return this.exec(cmd, []);
	}

	modelToInitString(model) {
		const fields = [];
		for (let prop in model.fields) {
			if (Object.prototype.hasOwnProperty.call(model.fields, prop)) {
				const f = model.fields[prop];
				fields.push(prop + ' ' + types[f.typeName.toLowerCase()] + (f.notNull ? ' not null' : ''));
			}
		}
		return 'create table ' + model.name + '(' + fields.join(',') + ');';
	}

	async exec(command, params) {
		return this.client.query(command, params);
	}
}

module.exports = PostgresqlProvider;