const db = require('../db');
const { Client } = require('pg');

const types = {
	'int': 'integer',
	'float': 'real',
	'datetime': 'timestamp',
	'string': 'text',
	'boolean': 'boolean'
};

const ops = {
	'!': '!',
	'!=': '!=',
	'==': '=',
	'>': '>',
	'<': '<',
	'>=': '>=',
	'<=': '<=',
	'&&': 'and',
	'||': 'or'
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
		const params = sets.map(f => f.value);
		const cmd = 'insert into ' + model + '(' + sets.map(f => f.name) + ')' + ' values(' + sets.map((value, index) => '$' + (index+1).toString()) + ');';
		console.log(cmd, params);
		return this.exec(cmd, params);
	}

	async getModels(model, fields, where, group, sort) {
		if (!this.validateGets(model, fields)) {
			throw new Error('invalid params');
		}
		if (where && !this.validateWhereParameter(model, where.opType, where.op, where.args)) {
			throw new Error('invalid where');
		}
		const params = [];
		let cmd = 'select ' + fields.map(f => typeof f === 'string' ? f : f.name).join(',') + ' from ' + model + ' ' + (where ? ('where ' + PostgresqlProvider._whereToString(where, params)) : '') + ';';
		console.log(cmd, params);
		const res = await this.exec(cmd, params);
		return res.rows;
	}

	static _whereArgToString(arg, params) {
		if (arg instanceof db.WhereCondition) {
			return '(' + PostgresqlProvider._whereToString(arg, params) + ')';
		} else if (arg.type === 'Literal') {
			params.push(arg.value);
			return '$' + params.length;
		} else {
			return arg.value;
		}
	}

	static _whereToString(where, params) {
		if (where.opType === 'unary') {
			return ' !(' + PostgresqlProvider._whereArgToString(where.args[0], params) + ') ';
		} else {
			if (where.args[1].type && where.args[1].value === null) {
				if (where.op === '==') {
					return PostgresqlProvider._whereArgToString(where.args[0], params) + ' is null';
				} else if (where.op === '!=') {
					return PostgresqlProvider._whereArgToString(where.args[0], params) + ' is not null';
				}
			}
			return PostgresqlProvider._whereArgToString(where.args[0], params) + ' ' + ops[where.op] + ' ' + PostgresqlProvider._whereArgToString(where.args[1], params);
		}
	}

	async updateModels(model, sets, where) {
		if (!this.validateSets(model, sets)) {
			throw new Error('invalid params');
		}
		if (where && !this.validateWhereParameter(model, where.opType, where.op, where.args)) {
			throw new Error('invalid where');
		}
		const params = sets.map(s => s.value);
		const cmd = 'update ' + model + ' set ' + sets.map((s, index) => s.name + ' = $'+(index+1).toString()).join(',') + ' ' + (where ? ('where ' + PostgresqlProvider._whereToString(where, params)) : '') + ';';
		console.log(cmd, params);
		return this.exec(cmd, params);
	}

	async deleteModels(model, where) {
		if (where && !this.validateWhereParameter(model, where.opType, where.op, where.args)) {
			throw new Error('invalid where');
		}
		const params = [];
		let cmd = 'delete from ' + model + ' ' + (where ? ('where ' + PostgresqlProvider._whereToString(where, params)) : '') + ' ;';
		console.log(cmd, params);
		return this.exec(cmd, params);
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