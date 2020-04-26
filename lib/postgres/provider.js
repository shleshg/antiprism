const db = require('../db');
const { Client } = require('pg');

const types = {
	'int': 'integer',
	'float': 'real',
	'datetime': 'timestamp',
	'string': 'string',
	'boolean': 'boolean'
};

class PostgresProvider extends db.DatabaseProvider {
	constructor(user, password, database, port) {
		super();
		this.config = {};
		if (user) {
			this.config.user = user;
		}
		if (password) {
			this.config.password = password;
		}
		if (database) {
			this.config.database = database;
		}
		if (port) {
			this.config.port = port;
		}
		this.client = new Client(this.config);
	}

	connect() {
		return this.client.connect();
	}

	insert() {

	}

	select() {

	}

	update() {

	}

	delete() {

	}

	modelToInitString(model) {
		let res = 'create table ' + model.name + '(' +
			model.fields
				.map(f => f.name + ' ' + types[f.type.value.toLowerCase()] + (f.type.notNull ? ' not null' : ''))
				.join(',') + ');';
		return res;
	}

	exec(command, params) {
		this.client.query(command, params);
	}
}

module.exports = PostgresProvider;