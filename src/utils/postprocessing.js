const assert = require('assert').strict;

function getPrimaryKey(model) {
	let singleId = null;
	const multipleId = [];
	for (const prop in model.fields) {
		const tags = model.fields[prop].tags;
		tags.forEach(t => {
			if (t.name === 'id') {
				if (!t.isDouble) {
					if (t.args === 'autoincrement()') {
						assert(model.fields[prop].typeName === 'Int', 'autoincrement can be only integer');
						model.fields[prop].default = 'autoincrement()';
					}
					assert(singleId === null, 'multiple single id in ' + model.name);
					singleId = [prop];
				} else {
					assert(multipleId.find(i => i === prop) === undefined, prop + ' in model ' + model.name + ' multiple times in @@id');
					multipleId.push(prop);
				}
			}
		});
	}
	assert.ok(!(singleId && multipleId.length !== 0), 'have single and multiple id');
	model.pk = singleId !== null ? singleId : multipleId;
}

function getDefaults(model) {
	for (const prop in model.fields) {
		const tags = model.fields[prop].tags;
		tags.forEach(t => {
			if (t.name === 'default') {
				assert(!model.fields[prop].default, 'multiple default');
				assert(!(model.fields[prop].typeName === 'DateTime' && t.value === 'now()'), 'default on time');
				model.fields[prop].default = t.args instanceof Object ? t.args.value : t.args;
			}
		});
	}
}

function getIndices(model) {
	const namedIndices = new Map();
	const multipleInd = [];
	const singleUniques = [];
	for (const prop in model.fields) {
		const tags = model.fields[prop].tags;
		tags.forEach(t => {
			if (t.name === 'unique') {
				if (t.isDouble) {
					let set;
					if (t.args instanceof Object && t.args.name === 'name') {
						set = namedIndices.has(prop) ? namedIndices.get(prop) : [];
						namedIndices.set(prop, set);
					} else {
						set = multipleInd;
					}
					assert(set.find(s => s === prop) === undefined, prop + ' mult index multiple time');
					set.push(prop);
				} else {
					assert(singleUniques.find(s => s === prop) === undefined, prop + ' single index multiple time');
					singleUniques.push(prop);
				}
			}
		})
	}
	model.indices = singleUniques.map(s => {
		return {
			name: 'ind_' + s,
			fields: [s]
		}
	});
	if (multipleInd.length !== 0) {
		model.indices = model.indices.concat([{
			name: 'mult_ind',
			fields: multipleInd
		}]);
	}
	namedIndices.forEach((v, k) => {
		model.indices.push({
			name: k,
			fields: v
		})
	});
}

const exp = module.exports;
exp.getPrimaryKey = getPrimaryKey;
exp.getDefaults = getDefaults;
exp.getIndices = getIndices;