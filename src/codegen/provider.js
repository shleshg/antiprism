const util = require('./util');
const exp = module.exports;

function getModelProvider(antiprism) {
	return {
		type: 'ExpressionStatement',
		expression: {
			type: 'AssignmentExpression',
			operator: '=',
			left: {
				type: 'MemberExpression',
				computed: false,
				object: util.Identfier('_exp'),
				property: util.Identfier('NewProvider')
			},
			right: {
				type: 'FunctionExpression',
				id: null,
				params: [
					util.Identfier('config')
				],
				body: {
					type: 'BlockStatement',
					body: [
						{
							type: 'IfStatement',
							test: {
								type: 'BinaryExpression',
								operator: '===',
								left: {
									type: 'UnaryExpression',
									operator: 'typeof',
									argument: util.Identfier('config'),
									prefix: true
								},
								right: util.Literal('string')
							},
							consequent: {
								type: 'BlockStatement',
								body: [
									{
										type: 'ExpressionStatement',
										expression: {
											type: 'AssignmentExpression',
											operator: '=',
											left: util.Identfier('config'),
											right: {
												type: 'CallExpression',
												callee: {
													type: 'MemberExpression',
													computed: false,
													object: util.Identfier('JSON'),
													property: util.Identfier('parse')
												},
												arguments: [
													{
														type: 'CallExpression',
														callee: {
															type: 'MemberExpression',
															computed: false,
															object: {
																type: 'CallExpression',
																callee: util.Identfier('require'),
																arguments: [
																	util.Literal('fs')
																]
															},
															property: util.Identfier('readFileSync')
														},
														arguments: [
															util.Identfier('config')
														]
													}
												]
											}
										}
									}
								]
							},
							alternate: null
						},
						{
							type: 'VariableDeclaration',
							declarations: [
								{
									type: 'VariableDeclarator',
									id: util.Identfier('res'),
									init: {
										type: 'NewExpression',
										callee: {
											type: 'MemberExpression',
											computed: false,
											object: util.Identfier('antiprism'),
											property: util.Identfier(util.providers[antiprism.datasource.provider] + 'Provider')
										},
										arguments: ['user', 'password', 'database', 'port'].map(a => {
											return {
												type: 'MemberExpression',
												computed: false,
												object: {
													type: 'MemberExpression',
													computed: false,
													object: util.Identfier('config'),
													property: util.Identfier('datasource')
												},
												property: util.Identfier(a)
											}
										}).concat([
											{
												type: 'MemberExpression',
												computed: false,
												object: util.Identfier('config'),
												property: util.Identfier('models')
											}
										])
									}
								}
							],
							kind: 'const'
						},
						{
							type: 'ExpressionStatement',
							expression: {
								type: 'AwaitExpression',
								argument: {
									type: 'CallExpression',
									callee: {
										type: 'MemberExpression',
										computed: false,
										object: util.Identfier('res'),
										property: util.Identfier('connect')
									},
									arguments: []
								}
							}
						},
						{
							type: 'ReturnStatement',
							argument: util.Identfier('res')
						}
					]
				},
				generator: false,
				expression: false,
				async: true
			}
		}
	}
}

function getModelWebProvider() {
	return {
		type: 'FunctionDeclaration',
		id: {
			type: 'Identifier',
			name: 'NewProvider'
		},
		params: [
			util.Identfier('config')
		],
		body: {
			type: 'BlockStatement',
			body: [
				{
					type: 'IfStatement',
					test: {
						type: 'BinaryExpression',
						operator: '===',
						left: {
							type: 'UnaryExpression',
							operator: 'typeof',
							argument: util.Identfier('config'),
							prefix: true
						},
						right: util.Literal('string')
					},
					consequent: {
						type: 'BlockStatement',
						body: [
							{
								type: 'ExpressionStatement',
								expression: {
									type: 'AssignmentExpression',
									operator: '=',
									left: util.Identfier('config'),
									right: {
										type: 'AwaitExpression',
										argument: {
											type: 'CallExpression',
											callee: {
												type: 'MemberExpression',
												computed: false,
												object: util.Identfier('antiprism'),
												property: util.Identfier('fetchConfig')
											},
											arguments: [
												util.Identfier('config')
											]
										}
									}
								}
							}
						]
					},
					alternate: null
				},
				{
					type: 'VariableDeclaration',
					declarations: [
						{
							type: 'VariableDeclarator',
							id: util.Identfier('res'),
							init: {
								type: 'NewExpression',
								callee: {
									type: 'MemberExpression',
									computed: false,
									object: util.Identfier('antiprism'),
									property: util.Identfier('HttpProvider')
								},
								arguments: ['user', 'password', 'database', 'port'].map(a => {
									return {
										type: 'MemberExpression',
										computed: false,
										object: {
											type: 'MemberExpression',
											computed: false,
											object: util.Identfier('config'),
											property: util.Identfier('datasource')
										},
										property: util.Identfier(a)
									}
								}).concat([
									{
										type: 'MemberExpression',
										computed: false,
										object: util.Identfier('config'),
										property: util.Identfier('models')
									}
								])
							}
						}
					],
					kind: 'const'
				},
				{
					type: 'ExpressionStatement',
					expression: {
						type: 'AwaitExpression',
						argument: {
							type: 'CallExpression',
							callee: {
								type: 'MemberExpression',
								computed: false,
								object: util.Identfier('res'),
								property: util.Identfier('connect')
							},
							arguments: []
						}
					}
				},
				{
					type: 'ReturnStatement',
					argument: util.Identfier('res')
				}
			]
		},
		generator: false,
		expression: false,
		async: true
	}
}

exp.getModelProvider = getModelProvider;
exp.getModelWebProvider = getModelWebProvider;