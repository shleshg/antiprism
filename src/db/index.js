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
		return wheres.map(w => this.validateWhereParameter(model, w.opType, w.op, w.args)).reduce((prev, cur) => prev && cur, true);
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
						assert(value ===null || value instanceof Number || typeof value === 'number', '');
					} else if (typeName === 'float') {
						assert(value ===null || value instanceof Number || typeof value === 'number', '');
					} else if (typeName === 'string') {
						assert(value ===null || value instanceof String || typeof value === 'string', '');
					} else if (typeName === 'datetime') {
						assert(value ===null || value instanceof Date, '');
					} else if (typeName === 'boolean') {
						assert(value ===null || value instanceof Boolean || typeof value === 'boolean', '');
					} else {
						assert(false, 'unknown type');
					}
					return true;
				}
			}
		}
		return false;
	}
	validateWhereParameter(model, opType, op, args) {
		return args.map(a => {
			if (a instanceof WhereCondition) {
				return this.validateWhereParameter(model, a.opType, a.op, a.args);
			}
			if (a.type === 'Field') {
				return this._models[model].fields.hasOwnProperty(a.value);
			}
			return true;
			// type checks
		}).reduce((prev, curr) => prev && curr, true);
	}
}

class DatabaseModel {
	constructor(provider, model) {
		assert(provider instanceof DatabaseProvider, 'expected provider to be DatabaseProvider instance');
		assert(model instanceof Object, 'expected model to be object');
		this._provider = provider;
		this._model = model;
	}
	static createModel() {
		assert(false, 'unimplemented create model');
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
	applySets() {
		assert(false, 'unimplemented apply sets');
	}
	identWhereParams() {
		assert(false, 'unimplemented ident where params');
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
		if (name instanceof Object && name.hasOwnProperty('name')) {
			this.fromObject(name);
		} else {
			this.name = name;
			this.value = value;
		}
	}
	fromObject(obj) {
		this.name = obj.name;
		if (obj.value && obj.value.isDate) {
			this.value = new Date(obj.value.value);
		} else {
			this.value = obj.value;
		}
	}
	toObject() {
		if (this.value instanceof Date) {
			return {
				name: this.name,
				value: {
					isDate: true,
					value: this.value.toUTCString()
				}
			}
		} else {
			return {
				name: this.name,
				value: this.value
			}
		}
	}
}

const whereUnaryOps = {
	'NOT': '!'
};

const whereBinaryOps = {
	'AND': '&&',
	'OR': '||',
	'EQUAL': '==',
	'LESS': '<',
	'ELESS': '<=',
	'GREATER': '>',
	'EGREATER': '>='
};

class WhereCondition {
	constructor(provider, opType, op, args) {
		assert(provider instanceof DatabaseProvider, 'expected provider to be DatabaseProvider instance');
		this.provider = provider;
		if (opType instanceof Object && opType.opType) {
			this.fromObject(opType);
		} else {
			assert(opType === 'unary' || opType === 'binary', 'expected opType to be unary or binary');
			if (opType === 'unary') {
				assert(op === '!', 'unexpected unary op');
			} else {
				assert(op === '&&' || op === '||' || op === '==' || op === '<' || op === '<=' || op === '>' || op === '>=', 'unexpected binary op');
			}
			args.forEach(a => {
				assert(a instanceof WhereCondition || a.type === 'Literal' || a.type === 'Field');
				if (a.type === 'Literal' || a.type === 'Field') {
					assert(a.hasOwnProperty('value'), 'expected value for literal or field');
				}
			});
			this.opType = opType;
			this.op = op;
			this.args = args;
		}
	}
	fromObject(obj) {
		this.opType = obj.opType;
		this.op = obj.op;
		this.args = obj.args.map(a => {
			if (a.hasOwnProperty('type')) {
				if (a.type === 'Literal' && a.value && a.value.isDate) {
					return {
						type: a.type,
						value: new Date(a.value.value)
					};
				} else {
					return {
						type: a.type,
						value: a.value
					};
				}
			} else {
				return new WhereCondition(this.provider, a);
			}
		});
	}
	toObject() {
		return {
			opType: this.opType,
			op: this.op,
			args: this.args.map(a => {
				if (a.value instanceof Date) {
					return {
						type: 'Literal',
						value: {
							isDate: true,
							value: a.value.toUTCString()
						}
					}
				} else {
					return a instanceof WhereCondition ? a.toObject() : a;
				}
			})
		};
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