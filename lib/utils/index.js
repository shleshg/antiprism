const exp = module.exports;

function checkUnique(models) {
	const names = new Map();
	return models.reduce((prev, current) => {
		const res = names.has(current);
		if (names.has(current.name)) {
			return false;
		}
		names.set(current.name, true);
		return true;
	}, true);
}

function validateModel(model) {
	return checkUnique(model.fields);
}

function validateDataSource(dataSource) {
	if (dataSource.hasOwnProperty('provider')) {
		if (!(dataSource.provider instanceof String)) {
			return false;
		}
	}
	if (dataSource.hasOwnProperty('database')) {
		if (!(dataSource.database instanceof String)) {
			return false;
		}
	}
	if (dataSource.hasOwnProperty('port')) {
		if (!(dataSource.port instanceof Number)) {
			return false;
		}
	}
	if (dataSource.hasOwnProperty('user')) {
		if (!(dataSource.user instanceof String)) {
			return false;
		}
	}
	if (dataSource.hasOwnProperty('password')) {
		if (!(dataSource.password instanceof String)) {
			return false;
		}
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