let assert;
if (typeof window === 'undefined') {
	assert = require('assert').strict.ok;
} else {
	assert = function (cond, message) {
		if (!cond) {
			console.log(message);
		}
	}
}

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
if (typeof window === 'undefined') {
	exports.GetParameter = GetParameter;
	exports.SetParameter = SetParameter;
	exports.WhereCondition = WhereCondition;
	exports.SortCondition = SortCondition;
	exports.GroupingCondition = GroupingCondition;
	exports.DatabaseProvider = DatabaseProvider;
	exports.DatabaseModel = DatabaseModel;
}
antiprism = {
	DatabaseProvider: DatabaseProvider,
	DatabaseModel: DatabaseModel,
	GetParameter: GetParameter,
	SetParameter: SetParameter,
	WhereCondition: WhereCondition
};

let httpId = 0;

async function fetchConfig(path) {
	const resp = await fetch(path);
	return await resp.json();
}

async function PostData(url, method, data) {
	const requestId = ++httpId;
	const response = await fetch(url, {
		method: 'POST',
		mode: 'cors',
		cache: 'no-cache',
		credentials: 'omit',
		headers: {
			'Content-Type': 'application/json'
		},
		redirect: 'follow',
		body: JSON.stringify({
			method: method,
			id: requestId,
			data: data
		})
	});
	return await response.json();
}

class HttpProvider extends antiprism.DatabaseProvider {
	constructor(user, password, database, port, models, url) {
		super(models);
		this.url = '/api/antiprism';
	}

	connect() {
		return this.exec('ping', null, null);
	}

	disconnect() {
		return true;
	}

	async insertModel(model, sets) {
		if (!this.validateSets(model, sets)) {
			throw new Error('invalid params');
		}
		const res = await this.exec('insert', {model: model, sets: sets.map(s => s.toObject())});
		return res.result;
	}

	async getModels(model, fields, where, group, sort) {
		if (!this.validateGets(model, fields)) {
			throw new Error('invalid params');
		}
		const res = await this.exec('get', {model: model, fields: fields, where: where, group: group, sort: sort});
		return res.result;
	}

	async updateModels(model, sets, where) {
		if (!this.validateSets(model, sets)) {
			throw new Error('invalid params');
		}
		const res = await this.exec('update', {model: model, sets: sets});
		return res.result;
	}

	async deleteModels(model, where) {
		const res = await this.exec('delete', {model: model, where: where});
		return res.result;
	}

	async exec(method, data) {
		return PostData(this.url, method, data);
	}
}

class HttpModel extends antiprism.DatabaseModel {
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

antiprism.HttpProvider = HttpProvider;
antiprism.HttpModel = HttpModel;
class test extends antiprism.HttpModel {
    constructor(provider, a, b) {
        super(provider, {
            name: 'test',
            fields: {
                a: {
                    typeName: 'Int',
                    notNull: true
                },
                b: {
                    typeName: 'Float',
                    notNull: true
                }
            }
        });
        this._value = {
            a: a,
            b: b
        };
    }
    static async createModel(provider, a, b) {
        (await provider.insertModel('test', [
            new antiprism.SetParameter(provider, 'a', a),
            new antiprism.SetParameter(provider, 'b', b)
        ]))
        return new test(provider, a, b);
    }
    static async getModels(provider, fields, where, group, sort) {
        const values = await provider.getModels('test', fields, where, group, sort);
        return values.map(v => new test(provider, v.a, v.b, true));
    }
    async update(sets) {
        await this._provider.updateModels('test', sets, []);
    }
    async delete() {
        await this._provider.deleteModels('test', []);
    }
    get a() {
        return this._value.a;
    }
    set a(a) {
        return new Promise(async (resolve, reject) => {
            await this.update([new antiprism.SetParameter(this._provider, 'a', a)]);
            resolve();
        });
    }
    get b() {
        return this._value.b;
    }
    set b(b) {
        return new Promise(async (resolve, reject) => {
            await this.update([new antiprism.SetParameter(this._provider, 'b', b)]);
            resolve();
        });
    }
}
class test2 extends antiprism.HttpModel {
    constructor(provider, s) {
        super(provider, {
            name: 'test2',
            fields: {
                s: {
                    typeName: 'DateTime',
                    notNull: false
                }
            }
        });
        this._value = { s: s };
    }
    static async createModel(provider, s) {
        (await provider.insertModel('test2', [new antiprism.SetParameter(provider, 's', s)]))
        return new test2(provider, s);
    }
    static async getModels(provider, fields, where, group, sort) {
        const values = await provider.getModels('test2', fields, where, group, sort);
        return values.map(v => new test2(provider, v.s, true));
    }
    async update(sets) {
        await this._provider.updateModels('test2', sets, []);
    }
    async delete() {
        await this._provider.deleteModels('test2', []);
    }
    get s() {
        return this._value.s;
    }
    set s(s) {
        return new Promise(async (resolve, reject) => {
            await this.update([new antiprism.SetParameter(this._provider, 's', s)]);
            resolve();
        });
    }
}
async function NewProvider(config) {
    if (typeof config === 'string') {
        config = await fetchConfig(config);
    }
    const res = new antiprism.HttpProvider(config.datasource.user, config.datasource.password, config.datasource.database, config.datasource.port, config.models);
    await res.connect();
    return res;
}