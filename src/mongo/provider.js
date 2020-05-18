const db = require('../db');
const MongoClient = require('mongodb').MongoClient;

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
	'==': '$eq',
	'>': '$gt',
	'<': '$lt',
	'>=': '$gte',
	'<=': '$lte',
	'&&': '$and',
	'||': '$or',
	'sum': '$sum',
	'avg': '$avg'
};

class MongoProvider extends db.DatabaseProvider {
	constructor(user, password, database, port, models) {
		super(models);
		const uri = "mongodb+srv://" + user + ':' + password + '@' + 'localhost:' + port + '/' + database + 'retryWrites=true&w=majority';
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
				res[prop] = toFlat[prop];
			}
		}
		return res;
	}

	async insertModel(model, sets) {
		if (!this.validateSets(model, sets)) {
			throw new Error('invalid params');
		}
		const m = this._models[model];
		const toInsert = {};
		for (const prop in m.fields) {
			const field = m.fields[prop];
			if (m.pk.find(v => v === prop)) {
				if (m.pk.length === 1) {
					if (field.default === 'autoincrement()') {
						toInsert._id = await this.getNextSequenceValue(model);
					}
				} else if (m.pk.length > 1) {
					toInsert._id = {};
					if (field.default === 'NOW()') {
						toInsert._id[prop] = new Date();
					} else if (field.value !== undefined) {
						toInsert._id[prop] = field.default.value;
					}
				}
			} else {
				if (field.default === 'NOW()') {
					toInsert[prop] = new Date();
				} else if (field.default.value !== undefined) {
					toInsert[prop] = field.default.value;
				}
			}
		}
		sets.forEach(s => {
			if (m.pk.find(v => v === s.name) !== undefined) {
				if (m.pk.length === 1) {
					toInsert['_id'] = s.value;
				} else {
					toInsert._id[s.name] = s.value;
				}
			} else {
				toInsert[s.name] = s.value;
			}
		});
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
		let projectModified = false;
		const m = this._models[model];
		const projection = {_id: 0};
		fields.filter(f => !f.operation).forEach(f => {
			const nameInRes = f.as ? f.as : f.name;
			if (m.pk.find(v => v === f.name) !== undefined) {
				if (m.pk.length === 1) {
					projection[nameInRes] = '_id';
				} else {
					projection[nameInRes] = '_id.' + f.name;
				}
			} else {
				projection[nameInRes] = 1;
			}
			projectModified = true;
		});
		const aggregateParams = [];
		if (where) {
			aggregateParams.push({$match: MongoProvider._whereToObject(where)});
		}
		if (group.length !== 0) {
			const groupParam = {_id: {}};
			group.forEach(g => {
				if (m.pk.find(v => v === g.name) !== undefined) {
					groupParam._id[g.name] = MongoProvider._fieldToIdName(g.name, m.pk.length > 1);
				} else {
					groupParam._id[g.name] = g.name;
				}
			});
			fields.filter(f => f.operation).forEach(f => {
				groupParam[f.as] = {};
				groupParam[f.as][ops[f.operation]] = '$' + f.name;
			});
			aggregateParams.push({$group: groupParam});
		}
		if (sort.length !== 0) {
			const sortParam = {};
			sort.forEach(s => {
				sortParam[s.name] = s.sortType === 'asc' ? 1 : -1;
			});
			aggregateParams.push({$sort: sortParam});
		}
		if (projectModified) {
			aggregateParams.push({$project: projection})
		}
		try {
			return await this.client.db().collection(model).aggregate(aggregateParams);
		} catch (e) {
			console.log('mongo get failed', e);
			return null;
		}
	}

	static _fieldToIdName(name, isEmbed) {
		return !isEmbed ? '_id' : '_id.' + name;
	}

	static _whereArgToMatchObject(arg) {
		if (arg instanceof db.WhereCondition) {
			return MongoProvider._whereToObject(arg);
		} else if (arg.type === 'Literal') {
			return arg.value;
		} else {
			return '$' + arg.value;
		}
	}

	static _whereToObject(where) {
		const res = {};
		if (where.opType === 'unary') {
			res[ops['!']] = MongoProvider._whereArgToMatchObject(where.args[0]);
		} else {
			res[ops[where.op]] = [MongoProvider._whereArgToMatchObject(where.args[0]), MongoProvider._whereArgToMatchObject(where.args[1])];
		}
	}

	async updateModels(model, sets, where) {
		if (!this.validateSets(model, sets)) {
			throw new Error('invalid params');
		}
		if (where && !this.validateWhereParameter(model, where.opType, where.op, where.args)) {
			throw new Error('invalid where');
		}
		const update = {$set: {}};
		sets.forEach(s => {
			if (s.value.isDefault) {
				const d = this._models[model].fields[s.name].default;
				if (d === 'NOW()') {
					update.$set[s.name] = new Date();
				} else {
					update.$set[s.name] = d;
				}
			} else {
				update.$set[s.name] = s.value;
			}
		});
		try {
			return await this.client.db().collection(model).updateMany(MongoProvider._whereToObject(where), update);
		} catch(e) {
			console.log('mongo update failed', e);
		}
	}

	async deleteModels(model, where) {
		if (where && !this.validateWhereParameter(model, where.opType, where.op, where.args)) {
			throw new Error('invalid where');
		}
		try {
			return await this.client.db().collection(model).deleteMany(MongoProvider._whereToObject(where));
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
		return doc.value;
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
		required.push('_id');
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
					description: 'must be a ' + types[field.typeName.toLowerCase()] + field.notNull ? ' and required' : ''
				}
			}
		}
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