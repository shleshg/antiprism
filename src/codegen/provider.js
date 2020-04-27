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
				object: {
					type: 'Identifier',
					name: '_exp'
				},
				property: {
					type: 'Identifier',
					name: 'NewProvider'
				}
			},
			right: {
				type: 'FunctionExpression',
				id: null,
				params: [
					{
						type: 'Identifier',
						name: 'config'
					}
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
									argument: {
										type: 'Identifier',
										name: 'window'
									},
									prefix: true
								},
								right: {
									type: 'Literal',
									value: 'undefined',
									raw: '\'undefined\''
								}
							},
							consequent: {
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
												argument: {
													type: 'Identifier',
													name: 'config'
												},
												prefix: true
											},
											right: {
												type: 'Literal',
												value: 'string',
												raw: '\'string\''
											}
										},
										consequent: {
											type: 'BlockStatement',
											body: [
												{
													type: 'ExpressionStatement',
													expression: {
														type: 'AssignmentExpression',
														operator: '=',
														left: {
															type: 'Identifier',
															name: 'config'
														},
														right: {
															type: 'CallExpression',
															callee: {
																type: 'MemberExpression',
																computed: false,
																object: {
																	type: 'Identifier',
																	name: 'JSON'
																},
																property: {
																	type: 'Identifier',
																	name: 'parse'
																}
															},
															arguments: [
																{
																	type: 'CallExpression',
																	callee: {
																		type: 'MemberExpression',
																		computed: false,
																		object: {
																			type: 'CallExpression',
																			callee: {
																				type: 'Identifier',
																				name: 'require'
																			},
																			arguments: [
																				{
																					type: 'Literal',
																					value: 'fs',
																					raw: '\'fs\''
																				}
																			]
																		},
																		property: {
																			type: 'Identifier',
																			name: 'readFileSync'
																		}
																	},
																	arguments: [
																		{
																			type: 'Identifier',
																			name: 'config'
																		}
																	]
																}
															]
														}
													}
												}
											]
										},
										alternate: null
									}
								]
							},
							alternate: {
								type: 'BlockStatement',
								body: [

								]
							}
						},
						{
							type: 'VariableDeclaration',
							declarations: [
								{
									type: 'VariableDeclarator',
									id: {
										type: 'Identifier',
										name: 'res'
									},
									init: {
										type: 'NewExpression',
										callee: {
											type: 'MemberExpression',
											computed: false,
											object: {
												type: 'Identifier',
												name: antiprism.datasource.provider
											},
											property: {
												type: 'Identifier',
												name: util.providers[antiprism.datasource.provider] + 'Provider'
											}
										},
										arguments: ['user', 'password', 'database', 'port'].map(a => {
											return {
												type: 'MemberExpression',
												computed: false,
												object: {
													type: 'MemberExpression',
													computed: false,
													object: {
														type: 'Identifier',
														name: 'config'
													},
													property: {
														type: 'Identifier',
														name: 'datasource'
													}
												},
												property: {
													type: 'Identifier',
													name: a
												}
											}
										}).concat([
											{
												type: 'MemberExpression',
												computed: false,
												object: {
													type: 'Identifier',
													name: 'config'
												},
												property: {
													type: 'Identifier',
													name: 'models'
												}
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
										object: {
											type: 'Identifier',
											name: 'res'
										},
										property: {
											type: 'Identifier',
											name: 'connect'
										}
									},
									arguments: []
								}
							}
						},
						{
							type: 'ReturnStatement',
							argument: {
								type: 'Identifier',
								name: 'res'
							}
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

exp.getModelProvider = getModelProvider;