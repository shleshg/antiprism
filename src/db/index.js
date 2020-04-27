const assert = require('assert').strict;

class DatabaseProvider {
	constructor(models) {
		assert.ok(models instanceof Array);
		this._models = {};
		models.forEach(m => {
			this._models[m.name] = m;
		})
	}
	insertModel(model, fields) {
		assert.ok(false, 'unimplemented insertModel');
	}
	getModels(model, fields, where, group, sort) {
		assert.ok(false, 'unimplemented getModels');
	}
	updateModels(model, sets, where) {
		assert.ok(false, 'unimplemented updateModels');
	}
	deleteModels(model, where) {
		assert.ok(false, 'unimplemented deleteModels');
	}
	connect() {
		assert.ok(false, 'unimplemented connect');
	}
	disconnect() {
		assert.ok(false, 'unimplemented disconnect');
	}
	modelToInitString() {
		assert.ok(false, 'unimplemented modelToInitString');
	}
	exec() {
		assert.ok(false, 'unimplemented exec');
	}
	validateGets(model, gets) {
		return gets.map(f => this.validateGetParameter(model, f)).reduce((prev, cur) => prev && cur, true);
	}
	validateSets(model, sets) {
		return sets.map(f =>  this.validateSetParameter(model, f.name, f.value)).reduce((prev, cur) => prev && cur, true);
	}
	validateWheres(model, wheres) {
		return wheres.map(w => this.validateWhereParameter(model, w.opType, w.op, w.first, w.second)).reduce((prev, cur) => prev && cur, true);
	}
	validateGetParameter(model, param) {
		let value;
		if (param instanceof String || typeof param === 'string') {
			value = param;
		} else if (param instanceof GetParameter) {
			value = param.name;
		} else {
			assert.ok(false, 'get parameter unknown type');
		}
		for (let prop in this._models[model].fields) {
			if (Object.prototype.hasOwnProperty.call(this._models[model].fields, prop)) {
				if (prop === value) {
					return true;
				}
			}
		}
		return false;
	}
	validateSetParameter(model, name, value) {
		assert.ok(typeof name === 'string', 'set parameter unknown type');
		for (let prop in this._models[model].fields) {
			if (Object.prototype.hasOwnProperty.call(this._models[model].fields, prop)) {
				if (prop === name) {
					const typeName = this._models[model].fields[name].typeName.toLowerCase();
					if (typeName === 'int') {
						assert.ok(value instanceof Number || typeof value === 'number', '');
					} else if (typeName === 'float') {
						assert.ok(value instanceof Number || typeof value === 'number', '');
					} else if (typeName === 'string') {
						assert.ok(value instanceof String || typeof value === 'string', '');
					} else if (typeName === 'datetime') {
						assert.ok(value instanceof Date, '');
					} else if (typeName === 'boolean') {
						assert.ok(value instanceof Boolean || typeof value === 'boolean', '');
					} else {
						assert.ok(false, 'unknown type');
					}
					return true;
				}
			}
		}
		return false;
	}
	validateWhereParameter(model, opType, op, first, second) {
		if (opType === 'unary') {

		} else {

		}
		return true;
	}
}

class DatabaseModel {
	constructor(provider, model) {
		assert.ok(provider instanceof DatabaseProvider, 'expected provider to be DatabaseProvider instance');
		assert.ok(model instanceof Object, 'expected model to be object');
		this._provider = provider;
		this._model = model;
	}
	static getModels() {
		assert.ok(false, 'unimplemented get models');
	}
	update() {
		assert.ok(false, 'unimplemented update');
	}
	delete() {
		assert.ok(false, 'unimplemented delete');
	}
}

class GetParameter {
	constructor(provider, name) {
		assert.ok(provider instanceof DatabaseProvider, 'expected provider to be DatabaseProvider instance');
		this.provider = provider;
		this.name = name;
	}
	toObject() {
		return {
			name: this.name
		}
	}
}

class SetParameter {
	constructor(provider, name, value) {
		assert.ok(provider instanceof DatabaseProvider, 'expected provider to be DatabaseProvider instance');
		this.provider = provider;
		this.name = name;
		this.value = value;
	}
	toObject() {
		return {
			name: this.name,
			value: this.value
		}
	}
}

class WhereCondition {
	constructor(provider, opType, op, first, second) {
		assert.ok(provider instanceof DatabaseProvider, 'expected provider to be DatabaseProvider instance');
		assert.ok(opType === 'unary' || opType === 'binary', 'expected opType to be unary or binary');
		assert.ok(op === '=' || op === '!' || op === '>' || op === '<' || op === '>=' || op === '<=', 'unexpected op');
		assert.ok(first.type === 'Literal' || first.type === 'Identifier', 'first type missing');
		assert.ok(second.type === 'Literal' || second.type === 'Identifier', 'second type missing');
		assert.ok(first.hasOwnProperty('value'), 'first value missing');
		assert.ok(second.hasOwnProperty('value'), 'second value missing');
		this.provider = provider;
		this.opType = opType;
		this.op = op;
		this.first = first;
		this.second = second;
	}
	toObject() {
		return {
			opType: this.opType,
			op: this.op,
			first: this.first,
			second: this.second
		}
	}
}

class SortCondition {
	constructor(provider, name) {
		assert.ok(provider instanceof DatabaseProvider, 'expected provider to be DatabaseProvider instance');
		this.provider = provider;
		this.name = name;
	}
}

class GroupingCondition {
	constructor(provider) {
		assert.ok(provider instanceof DatabaseProvider, 'expected provider to be DatabaseProvider instance');
		this.provider = provider;
	}
}

const exp = module.exports;

exp.GetParameter = GetParameter;
exp.SetParameter = SetParameter;
exp.WhereCondition = WhereCondition;
exp.SortCondition = SortCondition;
exp.GroupingCondition = GroupingCondition;
exp.DatabaseProvider = DatabaseProvider;
exp.DatabaseModel = DatabaseModel;