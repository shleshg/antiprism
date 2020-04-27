const exp = module.exports;

const providers = {
	'postgresql': 'Postgresql'
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

exp.providers = providers;
exp.requireStatement = requireStatement;
exp.getModelExport = getModelExport;
exp.getModelParams = getModelParams;
exp.modelToAst = modelToAst;