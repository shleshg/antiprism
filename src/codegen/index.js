const escodegen = require('escodegen');
const provider = require('./provider');
const model = require('./model');
const util = require('./util');

module.exports = function (antiprism) {
	const providerName = antiprism.datasource.provider;
	const toCode = {
		type: 'Program',
		body: [
			util.requireStatement('db', 'antiprism/src/db/index'),
			util.requireStatement(providerName, 'antiprism/src/' + providerName + '/index')
		]
	};
	toCode.body.push(
		...antiprism.models.map(m => {
			const params = util.getModelParams(m);
			return {
				type: 'ClassDeclaration',
				id: {
					type: 'Identifier',
					name: m.name
				},
				superClass: {
					type: 'MemberExpression',
					computed: false,
					object: {
						type: 'Identifier',
						name: providerName
					},
					property: {
						type: 'Identifier',
						name: util.providers[providerName] + 'Model'
					}
				},
				body: {
					type: 'ClassBody',
					body: [
						model.getModelConstructor(m, params),
						model.getModelCreateFunction(m, params),
						model.getModelGetFunction(m, params),
						model.getModelUpdateFunction(m),
						model.getModelDeleteFunction(m),
						...params.flatMap(model.getFieldGetterAndSetter)
					]
				}
			};
		})
	);
	toCode.body.push(
		{
			type: 'VariableDeclaration',
			declarations: [
				{
					type: 'VariableDeclarator',
					id: {
						type: 'Identifier',
						name: '_exp'
					},
					init: {
						type: 'MemberExpression',
						computed: false,
						object: {
							type: 'Identifier',
							name: 'module'
						},
						property: {
							type: 'Identifier',
							name: 'exports'
						}
					}
				}
			],
			kind: 'const'
		},
		...antiprism.models.map(m => util.getModelExport(m.name))
	);
	toCode.body.push(provider.getModelProvider(antiprism));
	return escodegen.generate(toCode);
};