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
				id: Identifier(variable),
				init: {
					type: 'CallExpression',
					callee: Identifier('require'),
					arguments: [
						Literal(path)
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
				key: Identifier(prop),
				computed: false
			};
			if (model[prop] instanceof Object) {
				property.value = exp.modelToAst(model[prop]);
			} else {
				property.value = Literal(model[prop])
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
				object: Identifier('_exp'),
				property: Identifier(name)
			},
			right: Identifier(name)
		}
	}
}

function getWebAntiprismImport(name, mod) {
	return {
		type: 'ExpressionStatement',
		expression: {
			type: 'AssignmentExpression',
			operator: '=',
			left: {
				type: 'MemberExpression',
				computed: false,
				object: Identifier('antiprism'),
				property: Identifier(name)
			},
			right: {
				type: 'MemberExpression',
				computed: false,
				object: Identifier(mod),
				property: Identifier(name)
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
exp.getWebAntiprismImport = getWebAntiprismImport;