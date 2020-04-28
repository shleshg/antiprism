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