const db = require('../db');
const { Client } = require('pg');
const params = require('./params');

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

	async insertModel(model, fields) {
		const cmd = 'insert into ' + model + '(' + fields.map(f => f.name) + ')' + 'values(' + fields.map((value, index) => '$' + index.toString()) + ');';
		console.log(cmd);
		await this.exec(cmd, fields.map(f => f.value));
	}

	async getModels(model, fields, where, group, sort) {
		const cmd = 'select ' + fields.map(f => f.name).join(',') + ' from ' + model + ';';
		console.log(cmd);
		await this.exec(cmd, []);
	}

	async updateModels(model, sets, where) {
		const cmd = 'update ' + model + ' ' + sets.map((s, index) => s.name = ' = $'+index.toString()).join(',') + ' ;';
		console.log(cmd);
		await this.exec(cmd, []);
	}

	async deleteModels(model, where) {
		let cmd = 'delete from ' + model;
		console.log(cmd);
		await this.exec(cmd, []);
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
		this.client.query(command, params);
	}
}

module.exports = PostgresqlProvider;