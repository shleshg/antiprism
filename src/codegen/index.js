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
				id: {
					type: 'Identifier',
					name: m.name
				},
				superClass: {
					type: 'MemberExpression',
					computed: false,
					object: {
						type: 'Identifier',
						name: 'antiprism'
					},
					property: {
						type: 'Identifier',
						name: util.providers[providerName] + 'Model'
					}
				},
				body: {
					type: 'ClassBody',
					body: [
						model.getModelConstructor(providerName, m, params),
						model.getModelCreateFunction(providerName, m, params),
						model.getModelGetFunction(providerName, m, params),
						model.getModelUpdateFunction(providerName, m),
						model.getModelDeleteFunction(providerName, m),
						...params.flatMap(p => model.getFieldGetterAndSetter(providerName, p))
					]
				}
			};
		})
	);
	if (isWeb) {
		toCode.body.push(provider.getModelWebProvider())
	} else {
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
				"type": "ExpressionStatement",
				"expression": {
					"type": "CallExpression",
					"callee": {
						"type": "ArrowFunctionExpression",
						"id": null,
						"params": [],
						"body": {
							"type": "BlockStatement",
							"body": [
								{
									"type": "VariableDeclaration",
									"declarations": [
										{
											"type": "VariableDeclarator",
											"id": {
												"type": "Identifier",
												"name": "provider"
											},
											"init": {
												"type": "AwaitExpression",
												"argument": {
													"type": "CallExpression",
													"callee": {
														"type": "MemberExpression",
														"computed": false,
														"object": {
															"type": "Identifier",
															"name": "client"
														},
														"property": {
															"type": "Identifier",
															"name": "NewProvider"
														}
													},
													"arguments": [
														{
															"type": "Literal",
															"value": "./config.json",
															"raw": "'./config.json'"
														}
													]
												}
											}
										}
									],
									"kind": "const"
								},
								{
									"type": "ExpressionStatement",
									"expression": {
										"type": "NewExpression",
										"callee": {
											"type": "MemberExpression",
											"computed": false,
											"object": {
												"type": "Identifier",
												"name": "antiprism"
											},
											"property": {
												"type": "Identifier",
												"name": "HttpServer"
											}
										},
										"arguments": [
											{
												"type": "Literal",
												"value": "/api/antiprism",
												"raw": "'/api/antiprism'"
											},
											{
												"type": "Identifier",
												"name": "provider"
											}
										]
									}
								}
							]
						},
						"generator": false,
						"expression": false,
						"async": true
					},
					"arguments": []
				}
			}
		]
	};
	return escodegen.generate(toCode);
}

exports.generateClient = generateClient;
exports.generateServer = generateServer;