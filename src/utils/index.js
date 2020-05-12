const assert = require('assert').strict;
const exp = module.exports;
const postprocessing = require('./postprocessing');

function checkUnique(models) {
	const names = new Map();
	return models.reduce((prev, current) => {
		if (names.has(current.name)) {
			return false;
		}
		names.set(current.name, true);
		return true;
	}, true);
}

function validateModel(model) {
	return true;
}

function validateDataSource(dataSource) {
	if (dataSource.hasOwnProperty('provider')) {
		assert.ok(typeof dataSource.provider === 'string'|| dataSource.provider instanceof String,
			'expected provider to be string');
	}
	if (dataSource.hasOwnProperty('database')) {
		assert.ok(typeof dataSource.database === 'string'|| dataSource.database instanceof String,
			'expected database to be string');
	}
	if (dataSource.hasOwnProperty('port')) {
		assert.ok(typeof dataSource.port === 'number'|| dataSource.port instanceof Number,
			'expected port to be string');
	}
	if (dataSource.hasOwnProperty('user')) {
		assert.ok(typeof dataSource.user === 'string'|| dataSource.user instanceof String,
			'expected user to be string');
	}
	if (dataSource.hasOwnProperty('password')) {
		assert.ok(typeof dataSource.password === 'string'|| dataSource.password instanceof String,
			'expected password to be string');
	}
	return true;
}

exp.validateAntiprismFile = function (antiprism) {
	return validateDataSource(antiprism.datasource) &&
		checkUnique(antiprism.models) &&
		antiprism.models
		.map(m => validateModel(m))
		.reduce((prev, current) => current && prev, true);
};

exp.postProcessAntiprism = function (antiprism) {
	antiprism.models.forEach(m => {
		postprocessing.getPrimaryKey(m);
		postprocessing.getIndices(m);
		postprocessing.getDefaults(m);
	});
};
