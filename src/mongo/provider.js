const db = require('../db');
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;

const types = {
	'int': 'int',
	'float': 'double',
	'datetime': 'date',
	'string': 'string',
	'boolean': 'bool'
};

const ops = {
	'!': '$not',
	'!=': '$ne',
	'==': '$match',
	'>': '$gt',
	'<': '$lt',
	'>=': '$gte',
	'<=': '$lte',
	'&&': '$and',
	'||': '$or',
	'sum': '$sum',
	'avg': '$avg'
};

const revert = {
	'!=': '!=',
	'>': '<=',
	'<': '>=',
	'>=': '<',
	'<=': '>'
};

class MongoProvider extends db.DatabaseProvider {
	constructor(user, password, database, port, models) {
		super(models);
		const uri = "mongodb://" + user + ':' + password + '@' + '127.0.0.1:' + port + '/' + database + '?retryWrites=true&w=majority';
		this.client = new MongoClient(uri, {useNewUrlParser: true});
	}

	connect() {
		return this.client.connect();
	}

	disconnect() {
		return this.client.close();
	}

	static flatId(model, toFlat) {
		const res = {};
		for (const prop in toFlat) {
			if (prop === '_id' && model.pk.length > 0) {
				if (toFlat[prop] instanceof Object) {
					for (const prop2 in toFlat[prop]) {
						res[prop2] = toFlat[prop][prop2];
					}
				} else {
					res[model.pk[0]] = toFlat[prop];
				}
			} else {
				if (toFlat[prop] instanceof mongo.Double) {
					res[prop] = toFlat[prop].value;
				} else {
					res[prop] = toFlat[prop];
				}
			}
		}
		return res;
	}

	static maybeDouble(model, name, value) {
		if (model.fields[name].typeName.toLowerCase() === 'float') {
			return new mongo.Double(value);
		} else {
			return value;
		}
	}

	async insertModel(model, sets) {
		if (!this.validateSets(model, sets)) {
			throw new Error('invalid params');
		}
		const m = this._models[model];
		const toInsert = {};
		for (const prop in m.fields) {
			const field = m.fields[prop];
			if (m.pk.find(v => v === prop) !== undefined) {
				if (m.pk.length === 1) {
					if (field.default === 'autoincrement()') {
						toInsert._id = await this.getNextSequenceValue(model);
					}
				} else if (m.pk.length > 1) {
					toInsert._id = {};
					if (field.default === 'NOW()') {
						toInsert._id[prop] = new Date();
					} else if (field.default !== undefined && field.default !== null) {
						toInsert._id[prop] = MongoProvider.maybeDouble(m, prop, field.default);
					}
				}
			} else {
				if (field.default === 'NOW()') {
					toInsert[prop] = new Date();
				} else if (field.default !== undefined && field.default !== null) {
					toInsert[prop] = MongoProvider.maybeDouble(m, prop, field.default);
				}
			}
		}
		sets.forEach(s => {
			if (m.pk.find(v => v === s.name) !== undefined) {
				if (m.pk.length === 1) {
					if (s.value !== null && !s.value.isDefault) {
						toInsert['_id'] = MongoProvider.maybeDouble(m, s.name, s.value);
					}
				} else {
					if (s.value !== null && !s.value.isDefault) {
						toInsert._id[s.name] = MongoProvider.maybeDouble(m, s.name, s.value);
					}
				}
			} else {
				if (s.value !== null && !s.value.isDefault) {
					toInsert[s.name] = MongoProvider.maybeDouble(m, s.name, s.value);
				}
			}
		});
		console.log(toInsert);
		try {
			await this.client.db().collection(model).insertOne(toInsert);
			return MongoProvider.flatId(m, toInsert);
		} catch (e) {
			console.log('mongo insert failed', e);
		}
	}

	async getModels(model, fields, where, group, sort) {
		if (!this.validateGets(model, fields)) {
			throw new Error('invalid params');
		}
		if (where && !this.validateWhereParameter(model, where.opType, where.op, where.args)) {
			throw new Error('invalid where');
		}
		if (group && !this.validateGroupings(model, group)) {
			throw new Error('invalid group');
		}
		if (sort && !this.validateSorts(model, sort)) {
			throw new Error('invalid sort');
		}
		const aggregateParams = [];
		const m = this._models[model];
		if (where) {
			aggregateParams.push({$match: MongoProvider._whereToObject(m, where)});
		}
		let idProjModified = false;
		const idProjection = {_id: 0};
		for (const prop in m.fields) {
			if (m.pk.find(v => v === prop) !== undefined) {
				if (m.pk.length === 1) {
					idProjection[prop] = '$_id';
				} else {
					idProjection[prop] = '$_id.' + prop;
				}
			} else {
				idProjection[prop] = 1;
			}
			idProjModified = true;
		}
		if (idProjModified) {
			aggregateParams.push({$project: idProjection});
		}
		if (sort.length !== 0) {
			const sortParam = {};
			sort.forEach(s => {
				sortParam[s.name] = s.sortType === 'asc' ? 1 : -1;
			});
			aggregateParams.push({$sort: sortParam});
		}
		if (group.length > 0) {
			const groupParam = {_id: {}};
			group.forEach(g => {
				groupParam._id[g.name] = '$' + g.name;
			});
			fields.filter(f => f.operation).forEach(f => {
				groupParam[f.as] = {};
				groupParam[f.as][ops[f.operation]] = '$' + f.name;
			});
			aggregateParams.push({$group: groupParam});
			const groupRename = {};
			group.forEach(g => {
				groupRename[g.name] = '$_id.' + g.name;
			});
			fields.filter(f => f.operation).forEach(f => {
				groupRename[f.as] = '$' + f.as;
			});
			aggregateParams.push({$project: groupRename});
		}
		const projection = {_id: 0};
		fields.filter(f => f.operation).forEach(f => {
			projection[f.as] = 1;
		});
		fields.filter(f => !f.operation).forEach(f => {
			projection[f.as ? f.as : f.name] = 1;
		});
		aggregateParams.push({$project: projection});
		try {
			console.log(aggregateParams);
			console.log(JSON.stringify(aggregateParams));
			const res = await this.client.db().collection(model).aggregate(aggregateParams);
			// console.log(res);
			return res.toArray();
		} catch (e) {
			console.log('mongo get failed', e);
			return null;
		}
	}

	static _fieldToIdName(name, isEmbed) {
		return !isEmbed ? '$_id' : '$_id.' + name;
	}

	static _whereArgToMatchObject(model, arg) {
		if (arg instanceof db.WhereCondition) {
			return MongoProvider._whereToObject(model, arg);
		} else if (arg.type === 'Literal') {
			return arg.value;
		} else {
			if (model.pk.find(v => v === arg.value) !== undefined) {
				return MongoProvider._fieldToIdName(arg.value, model.pk.length > 1);
			} else {
				return '$' + arg.value;
			}
		}
	}

	static _whereArgIsField(arg) {
		return typeof arg === 'string' && arg.substr(0, 1) === '$';
	}

	static _whereToObject(model, where) {
		const res = {};
		if (where.opType === 'unary') {
			res[ops['!']] = MongoProvider._whereArgToMatchObject(model, where.args[0]);
		} else {
			const arg0 = MongoProvider._whereArgToMatchObject(model, where.args[0]);
			const arg1 = MongoProvider._whereArgToMatchObject(model, where.args[1]);
			if (where.op === '&&' || where.op === '||') {
				res[ops[where.op]] = [arg0, arg1];
			} else if (where.op === '==') {
				if (MongoProvider._whereArgIsField(arg0)) {
					res[arg0.substr(1)] = arg1;
				} else if (MongoProvider._whereArgIsField(arg1)) {
					res[arg1.substr(1)] = arg0
				} else {
					throw new Error('condition no field');
				}
			} else {
				if (MongoProvider._whereArgIsField(arg0)) {
					res[arg0.substr(1)] = {};
					res[arg0.substr(1)][ops[where.op]] = arg1;
				} else if (MongoProvider._whereArgIsField(arg1)) {
					res[arg1.substr(1)] = {};
					res[arg1.substr(1)][ops[revert[where.op]]] = arg0;
				} else {
					throw new Error('condition no field');
				}
			}
		}
		return res;
	}

	async updateModels(model, sets, where) {
		if (!this.validateSets(model, sets)) {
			throw new Error('invalid params');
		}
		if (where && !this.validateWhereParameter(model, where.opType, where.op, where.args)) {
			throw new Error('invalid where');
		}
		const update = {$set: {}};
		const m = this._models[model];
		sets.forEach(s => {
			if (s.value !== null && s.value.isDefault) {
				const d = m.fields[s.name].default;
				if (d === 'NOW()') {
					update.$set[s.name] = new Date();
				} else {
					update.$set[s.name] = d;
				}
			} else {
				update.$set[s.name] = MongoProvider.maybeDouble(m, s.name, s.value);
			}
		});
		try {
			console.log(JSON.stringify(MongoProvider._whereToObject(m, where)), JSON.stringify(update));
			return await this.client.db().collection(model).updateMany(MongoProvider._whereToObject(m, where), update);
		} catch(e) {
			console.log('mongo update failed', e);
		}
	}

	async deleteModels(model, where) {
		if (where && !this.validateWhereParameter(model, where.opType, where.op, where.args)) {
			throw new Error('invalid where');
		}
		const m = this._models[model];
		try {
			console.log(JSON.stringify(MongoProvider._whereToObject(m, where)));
			return await this.client.db().collection(model).deleteMany(MongoProvider._whereToObject(m, where));
		} catch (e) {
			console.log('mongo delete failed', e);
		}
	}

	async getNextSequenceValue(model) {
		const doc = await this.client.db().collection('autoinc_seq').findOneAndUpdate({
				_id: model
			},
			{
				$inc: {value: 1}
			});
		console.log(doc);
		return doc.value.value;
	}

	async init(model) {
		if (model.pk.length === 1) {
			if (model.fields[model.pk[0]].default === 'autoincrement()') {
				this.client.db().collection('autoinc_seq').insertOne({
					_id: model.name,
					value: 0
				});
			}
		}
		const required = [];
		const props = {};
		// required.push('_id');
		for (const prop in model.fields) {
			const field = model.fields[prop];
			if (model.pk.find(m => prop === m) !== undefined) {
				if (model.pk.length === 1) {
					props['_id'] = {
						bsonType: types[field.typeName.toLowerCase()],
						description: 'must be a ' + types[field.typeName.toLowerCase()] + ' and required'
					}
				} else {
					if (props['_id'] === undefined) {
						props['_id'] = {
							bsonType: 'object',
							required: [],
							properties: {}
						}
					}
					props['_id'].required.push(prop);
					props['_id'].properties[prop] = {
						bsonType: types[field.typeName.toLowerCase()],
						description: 'must be a ' + types[field.typeName.toLowerCase()] + ' and required'
					}
				}
			} else {
				if (field.notNull) {
					required.push(prop);
				}
				props[prop] = {
					bsonType: types[field.typeName.toLowerCase()],
					description: 'must be a ' + types[field.typeName.toLowerCase()] + (field.notNull ? ' and required' : '')
				}
			}
		}
		console.log(required, props);
		await this.client.db().createCollection(model.name, {
			validator: {
				$jsonSchema: {
					bsonType: 'object',
					required: required,
					properties: props
				}
			}
		});
		if (model.indices.length > 0) {
			await this.client.db().collection(model.name).createIndexes(model.indices.map(i => {
				return {
					key: i.fields.reduce((prev, f) => {
						prev[f] = 1;
					}, {}),
					name: i.name,
					unique: true
				}
			}));
		}
	}
}

module.exports = MongoProvider;