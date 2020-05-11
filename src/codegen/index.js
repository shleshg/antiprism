const escodegen = require('escodegen');
const provider = require('./provider');
const model = require('./model');
const util = require('./util');

function generateClient(antiprism, isWeb) {
	const providerName = antiprism.datasource.provider;
	const toCode = {
		type: 'Program',
		body: []
	};
	if (!isWeb) {
		toCode.body.push(util.requireStatement('antiprism', 'antiprism'));
	}
	toCode.body.push(
		...antiprism.models.map(m => {
			const params = util.getModelParams(m);
			return {
				type: 'ClassDeclaration',
				id: util.Identfier(m.name),
				superClass: {
					type: 'MemberExpression',
					computed: false,
					object: util.Identfier('antiprism'),
					property: util.Identfier(isWeb ? 'DatabaseModel' : util.providers[providerName] + 'Model')
				},
				body: {
					type: 'ClassBody',
					body: [
						model.getModelConstructor(providerName, m, params),
						model.getModelCreateFunction(providerName, m, params),
						model.getModelGetFunction(providerName, m, params),
						model.getModelUpdateFunction(providerName, m),
						model.getModelDeleteFunction(providerName, m),
						model.getApplySets(),
						model.getIdentWhereParams(m, params),
						...params.flatMap(p => model.getFieldGetterAndSetter(providerName, p))
					]
				}
			};
		})
	);
	if (isWeb) {
		toCode.body.push({
			type: 'VariableDeclaration',
			declarations: [
				{
					type: 'VariableDeclarator',
					id: util.Identfier('AllModels'),
					init: {
						type: 'ObjectExpression',
						properties: antiprism.models.map(m => provider.getModelAssignment(m.name))
					}
				}
			],
			kind: 'const'
		});
		toCode.body.push(provider.getModelWebProvider('HttpProvider'), provider.getModelWebProvider('WsProvider'))
	} else {
		toCode.body.push(
			{
				type: 'VariableDeclaration',
				declarations: [
					{
						type: 'VariableDeclarator',
						id: util.Identfier('_exp'),
						init: {
							type: 'MemberExpression',
							computed: false,
							object: util.Identfier('module'),
							property: util.Identfier('exports')
						}
					}
				],
				kind: 'const'
			},
			...antiprism.models.map(m => util.getModelExport(m.name))
		);
		toCode.body.push(provider.getModelProvider(antiprism));
	}
	return escodegen.generate(toCode);
}

function generateServer(antiprism) {
	const toCode = {
		type: 'Program',
		body: [
			util.requireStatement('antiprism', 'antiprism'),
			util.requireStatement('client', './client'),
			{
				type: "ExpressionStatement",
				expression: {
					type: "CallExpression",
					callee: {
						type: "ArrowFunctionExpression",
						id: null,
						params: [],
						body: {
							type: "BlockStatement",
							body: [
								{
									type: "VariableDeclaration",
									declarations: [
										{
											type: "VariableDeclarator",
											id: util.Identfier('provider'),
											init: {
												type: "AwaitExpression",
												argument: {
													type: "CallExpression",
													callee: {
														type: "MemberExpression",
														computed: false,
														object: util.Identfier('client'),
														property: util.Identfier('NewProvider')
													},
													arguments: [
														util.Literal('./config.json')
													]
												}
											}
										}
									],
									kind: "const"
								},
								{
									type: "ExpressionStatement",
									expression: {
										type: "NewExpression",
										callee: {
											type: "MemberExpression",
											computed: false,
											object: util.Identfier('antiprism'),
											property: util.Identfier('HttpServer')
										},
										arguments: [
											util.Literal('/api/antiprism'),
											util.Identfier('provider')
										]
									}
								}
							]
						},
						generator: false,
						expression: false,
						async: true
					},
					arguments: []
				}
			}
		]
	};
	return escodegen.generate(toCode);
}

exports.generateClient = generateClient;
exports.generateServer = generateServer;