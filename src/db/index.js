const assert = require('assert').strict.ok;

class DatabaseProvider {
	constructor(models) {
		assert(models instanceof Array);
		this._models = {};
		models.forEach(m => {
			this._models[m.name] = m;
		})
	}
	insertModel(model, fields) {
		assert(false, 'unimplemented insertModel');
	}
	getModels(model, fields, where, group, sort) {
		assert(false, 'unimplemented getModels');
	}
	updateModels(model, sets, where) {
		assert(false, 'unimplemented updateModels');
	}
	deleteModels(model, where) {
		assert(false, 'unimplemented deleteModels');
	}
	connect() {
		assert(false, 'unimplemented connect');
	}
	disconnect() {
		assert(false, 'unimplemented disconnect');
	}
	modelToInitString() {
		assert(false, 'unimplemented modelToInitString');
	}
	exec() {
		assert(false, 'unimplemented exec');
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
		} else if (param instanceof Object && param.hasOwnProperty('name')) {
			value = param.name;
		} else {
			assert(false, 'get parameter unknown type');
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
		assert(typeof name === 'string', 'set parameter unknown type');
		for (let prop in this._models[model].fields) {
			if (Object.prototype.hasOwnProperty.call(this._models[model].fields, prop)) {
				if (prop === name) {
					const typeName = this._models[model].fields[name].typeName.toLowerCase();
					if (typeName === 'int') {
						assert(value instanceof Number || typeof value === 'number', '');
					} else if (typeName === 'float') {
						assert(value instanceof Number || typeof value === 'number', '');
					} else if (typeName === 'string') {
						assert(value instanceof String || typeof value === 'string', '');
					} else if (typeName === 'datetime') {
						assert(value instanceof Date, '');
					} else if (typeName === 'boolean') {
						assert(value instanceof Boolean || typeof value === 'boolean', '');
					} else {
						assert(false, 'unknown type');
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
		assert(provider instanceof DatabaseProvider, 'expected provider to be DatabaseProvider instance');
		assert(model instanceof Object, 'expected model to be object');
		this._provider = provider;
		this._model = model;
	}
	static getModels() {
		assert(false, 'unimplemented get models');
	}
	update() {
		assert(false, 'unimplemented update');
	}
	delete() {
		assert(false, 'unimplemented delete');
	}
}

class GetParameter {
	constructor(provider, name) {
		assert(provider instanceof DatabaseProvider, 'expected provider to be DatabaseProvider instance');
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
		assert(provider instanceof DatabaseProvider, 'expected provider to be DatabaseProvider instance');
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
		assert(provider instanceof DatabaseProvider, 'expected provider to be DatabaseProvider instance');
		assert(opType === 'unary' || opType === 'binary', 'expected opType to be unary or binary');
		assert(op === '=' || op === '!' || op === '>' || op === '<' || op === '>=' || op === '<=', 'unexpected op');
		assert(first.type === 'Literal' || first.type === 'Identifier', 'first type missing');
		assert(second.type === 'Literal' || second.type === 'Identifier', 'second type missing');
		assert(first.hasOwnProperty('value'), 'first value missing');
		assert(second.hasOwnProperty('value'), 'second value missing');
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
		assert(provider instanceof DatabaseProvider, 'expected provider to be DatabaseProvider instance');
		this.provider = provider;
		this.name = name;
	}
}

class GroupingCondition {
	constructor(provider) {
		assert(provider instanceof DatabaseProvider, 'expected provider to be DatabaseProvider instance');
		this.provider = provider;
	}
}

exports.GetParameter = GetParameter;
exports.SetParameter = SetParameter;
exports.WhereCondition = WhereCondition;
exports.SortCondition = SortCondition;
exports.GroupingCondition = GroupingCondition;
exports.DatabaseProvider = DatabaseProvider;
exports.DatabaseModel = DatabaseModel;