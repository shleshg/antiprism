const exp = module.exports;

const providers = {
	'mongo': 'Mongo',
	'postgresql': 'Postgresql',
	'http': 'Http',
	'ws': 'Ws'
};

function requireStatement(variable, path) {
	return {
		type: 'VariableDeclaration',
		declarations: [
			{
				type: 'VariableDeclarator',
				id: {
					type: 'Identifier',
					name: variable
				},
				init: {
					type: 'CallExpression',
					callee: {
						type: 'Identifier',
						name: 'require'
					},
					arguments: [
						{
							type: 'Literal',
							value: path,
							raw: '\'' + path + '\''
						}
					]
				}
			}
		],
		kind: 'const'
	}
}

function modelToAst(model) {
	const res = {
		type: 'ObjectExpression',
		properties: []
	};
	for (const prop in model) {
		if (Object.prototype.hasOwnProperty.call(model, prop)) {
			const property = {
				type: 'Property',
				key: {
					type: 'Identifier',
					name: prop,
				},
				computed: false
			};
			if (model[prop] instanceof Object) {
				property.value = exp.modelToAst(model[prop]);
			} else {
				property.value = {
					type: 'Literal',
					value: model[prop],
					raw: '\'' + model[prop] + '\''
				}
			}
			res.properties.push(property);
		}
	}
	return res;
}

function getModelParams(model) {
	const res = [];
	for (const prop in model.fields) {
		if (Object.prototype.hasOwnProperty.call(model.fields, prop)) {
			res.push(prop);
		}
	}
	return res;
}

function getModelExport(name) {
	return {
		type: 'ExpressionStatement',
		expression: {
			type: 'AssignmentExpression',
			operator: '=',
			left: {
				type: 'MemberExpression',
				computed: false,
				object: {
					type: 'Identifier',
					name: '_exp'
				},
				property: {
					type: 'Identifier',
					name: name
				}
			},
			right: {
				type: 'Identifier',
				name: name
			}
		}
	}
}

function Identifier(name) {
	return {
		type: 'Identifier',
		name: name
	}
}

function Literal(value) {
	return {
		type: 'Literal',
		value: value,
		raw: '\'' + value +'\''
	}
}

exp.providers = providers;
exp.requireStatement = requireStatement;
exp.getModelExport = getModelExport;
exp.getModelParams = getModelParams;
exp.modelToAst = modelToAst;
exp.Identfier = Identifier;
exp.Literal = Literal;