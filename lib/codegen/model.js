const util = require('./util');
const exp = module.exports;

function getFieldGetterAndSetter(name) {
	return [
		{
			type: 'MethodDefinition',
			key: {
				type: 'Identifier',
				name: name
			},
			computed: false,
			value: {
				type: 'FunctionExpression',
				id: null,
				params: [],
				body: {
					type: 'BlockStatement',
					body: [
						{
							type: 'ReturnStatement',
							argument: {
								type: 'MemberExpression',
								computed: false,
								object: {
									type: 'MemberExpression',
									computed: false,
									object: {
										type: 'ThisExpression'
									},
									property: {
										type: 'Identifier',
										name: '_value'
									}
								},
								property: {
									type: 'Identifier',
									name: name
								}
							}
						}
					]
				},
				generator: false,
				expression: false,
				async: false
			},
			kind: 'get',
			static: false
		},
		{
			type: 'MethodDefinition',
			key: {
				type: 'Identifier',
				name: name
			},
			computed: false,
			value: {
				type: 'FunctionExpression',
				id: null,
				params: [
					{
						type: 'Identifier',
						name: name
					}
				],
				body: {
					type: 'BlockStatement',
					body: [
						{
							type: 'ReturnStatement',
							argument: {
								type: 'NewExpression',
								callee: {
									type: 'Identifier',
									name: 'Promise'
								},
								arguments: [
									{
										type: 'ArrowFunctionExpression',
										id: null,
										params: [
											{
												type: 'Identifier',
												name: 'resolve'
											},
											{
												type: 'Identifier',
												name: 'reject'
											}
										],
										body: {
											type: 'BlockStatement',
											body: [
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
																	type: 'ThisExpression'
																},
																property: {
																	type: 'Identifier',
																	name: 'update'
																}
															},
															arguments: [
																{
																	type: 'ArrayExpression',
																	elements: [
																		{
																			type: 'NewExpression',
																			callee: {
																				type: 'MemberExpression',
																				computed: false,
																				object: {
																					type: 'Identifier',
																					name: 'db'
																				},
																				property: {
																					type: 'Identifier',
																					name: 'SetParameter'
																				}
																			},
																			arguments: [
																				{
																					type: 'MemberExpression',
																					computed: false,
																					object: {
																						type: 'ThisExpression'
																					},
																					property: {
																						type: 'Identifier',
																						name: '_provider'
																					}
																				},
																				{
																					type: 'Literal',
																					value: name,
																					raw: '\'' + name + '\''
																				},
																				{
																					type: 'Identifier',
																					name: name
																				}
																			]
																		}
																	]
																}
															]
														}
													}
												},
												{
													type: 'ExpressionStatement',
													expression: {
														type: 'CallExpression',
														callee: {
															type: 'Identifier',
															name: 'resolve'
														},
														arguments: []
													}
												}
											]
										},
										generator: false,
										expression: false,
										async: true
									}
								]
							}
						}
					]
				},
				generator: false,
				expression: false,
				async: false
			},
			kind: 'set',
			static: false
		}
	]
}

function getModelConstructor(model, params) {
	return {
		type: 'MethodDefinition',
		key: {
			type: 'Identifier',
			name: 'constructor'
		},
		computed: false,
		value: {
			type: 'FunctionExpression',
			id: null,
			params: [
				{
					type: 'Identifier',
					name: 'provider'
				},
				...params.map(p => {
					return {
						type: 'Identifier',
						name: p
					};
				})
			],
			body: {
				type: 'BlockStatement',
				body: [
					{
						type: 'ExpressionStatement',
						expression: {
							type: 'CallExpression',
							callee: {
								type: 'Super'
							},
							arguments: [
								{
									type: 'Identifier',
									name: 'provider'
								},
								util.modelToAst(model)
							]
						}
					},
					{
						type: 'ExpressionStatement',
						expression: {
							type: 'AssignmentExpression',
							operator: '=',
							left: {
								type: 'MemberExpression',
								computed: false,
								object: {
									type: 'ThisExpression'
								},
								property: {
									type: 'Identifier',
									name: '_value'
								}
							},
							right: {
								type: 'ObjectExpression',
								properties: params.map(p => {
									return {
										type: 'Property',
										key: {
											type: 'Identifier',
											name: p
										},
										computed: false,
										value: {
											type: 'Identifier',
											name: p
										}
									};
								})

							}
						}
					}
				]
			},
			generator: false,
			expression: false,
			async: false
		},
		kind: 'constructor',
		static: false
	}
}

function getModelCreateFunction(model, params) {
	return {
		type: 'MethodDefinition',
		key: {
			type: 'Identifier',
			name: 'createModel'
		},
		computed: false,
		value: {
			type: 'FunctionExpression',
			id: null,
			params: [
				{
					type: 'Identifier',
					name: 'provider'
				},
				...params.map(p => {
					return {
						type: 'Identifier',
						name: p
					};
				})
			],
			body: {
				type: 'BlockStatement',
				body: [
					{
						type: 'AwaitExpression',
						argument: {
							type: 'CallExpression',
							callee: {
								type: 'MemberExpression',
								computed: false,
								object: {
									type: 'Identifier',
									name: 'provider'
								},
								property: {
									type: 'Identifier',
									name: 'insertModel'
								}
							},
							arguments: [
								{
									type: 'Literal',
									value: model.name,
									raw: '\'' + model.name + '\''
								},
								{
									type: 'ArrayExpression',
									elements: params.map(p => {
										return {
											type: 'NewExpression',
											callee: {
												type: 'MemberExpression',
												computed: false,
												object: {
													type: 'Identifier',
													name: 'db'
												},
												property: {
													type: 'Identifier',
													name: 'SetParameter'
												}
											},
											arguments: [
												{
													type: 'Identifier',
													name: 'provider'
												},
												{
													type: 'Literal',
													value: p,
													raw: '\'' + p + '\''
												},
												{
													type: 'Identifier',
													name: p
												}
											]
										}
									})
								}
							]

						}
					},
					{
						type: 'ReturnStatement',
						argument: {
							type: 'NewExpression',
							callee: {
								type: 'Identifier',
								name: model.name
							},
							arguments: [
								{
									type: 'Identifier',
									name: 'provider'
								},
								...params.map(p => {
									return {
										type: 'Identifier',
										name: p
									}
								})
							]
						}
					}
				]
			},
			generator: false,
			expression: false,
			async: true
		},
		kind: 'method',
		static: true
	}
}

function getModelGetFunction(model, params) {
	return {
		type: 'MethodDefinition',
		key: {
			type: 'Identifier',
			name: 'getModels'
		},
		computed: false,
		value: {
			type: 'FunctionExpression',
			id: null,
			params: [
				{
					type: 'Identifier',
					name: 'provider'
				},
				{
					type: 'Identifier',
					name: 'fields'
				},
				{
					type: 'Identifier',
					name: 'where'
				},
				{
					type: 'Identifier',
					name: 'group'
				},
				{
					type: 'Identifier',
					name: 'sort'
				}
			],
			body: {
				type: 'BlockStatement',
				body: [
					{
						type: 'VariableDeclaration',
						declarations: [
							{
								type: 'VariableDeclarator',
								id: {
									type: 'Identifier',
									name: 'values'
								},
								init: {
									type: 'AwaitExpression',
									argument: {
										type: 'CallExpression',
										callee: {
											type: 'MemberExpression',
											computed: false,
											object: {
												type: 'Identifier',
												name: 'provider'
											},
											property: {
												type: 'Identifier',
												name: 'getModels'
											}
										},
										arguments: [
											{
												type: 'Literal',
												value: model.name,
												raw: '\'' + model.name + '\''
											},
											{
												type: 'Identifier',
												name: 'fields'
											},
											{
												type: 'Identifier',
												name: 'where'
											},
											{
												type: 'Identifier',
												name: 'group'
											},
											{
												type: 'Identifier',
												name: 'sort'
											}
										]

									}
								}
							}
						],
						kind: 'const'
					},
					{
						type: 'ReturnStatement',
						argument: {
							type: 'CallExpression',
							callee: {
								type: 'MemberExpression',
								computed: false,
								object: {
									type: 'Identifier',
									name: 'values'
								},
								property: {
									type: 'Identifier',
									name: 'map'
								}
							},
							arguments: [
								{
									type: 'ArrowFunctionExpression',
									id: null,
									params: [
										{
											type: 'Identifier',
											name: 'v'
										}
									],
									body: {
										type: 'NewExpression',
										callee: {
											type: 'Identifier',
											name: model.name
										},
										arguments: [
											{
												type: 'Identifier',
												name: 'provider'
											},
											...params.map(p => {
												return {
													type: 'MemberExpression',
													computed: false,
													object: {
														type: 'Identifier',
														name: 'v'
													},
													property: {
														type: 'Identifier',
														name: p
													}
												}
											}),
											{
												type: 'Literal',
												value: true,
												raw: 'true'
											}
										]
									},
									generator: false,
									expression: true,
									async: false
								}
							]
						}
					}
				]
			},
			generator: false,
			expression: false,
			async: true
		},
		kind: 'method',
		static: true
	};
}

function getModelUpdateFunction(model) {
	return {
		type: 'MethodDefinition',
		key: {
			type: 'Identifier',
			name: 'update'
		},
		computed: false,
		value: {
			type: 'FunctionExpression',
			id: null,
			params: [
				{
					type: 'Identifier',
					name: 'sets'
				}
			],
			body: {
				type: 'BlockStatement',
				body: [
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
										type: 'MemberExpression',
										computed: false,
										object: {
											type: 'ThisExpression'
										},
										property: {
											type: 'Identifier',
											name: '_provider'
										}
									},
									property: {
										type: 'Identifier',
										name: 'updateModels'
									}
								},
								arguments: [
									{
										type: 'Literal',
										value: model.name,
										raw: '\'' + model.name + '\''
									},
									{
										type: 'Identifier',
										name: 'sets'
									},
									{
										type: 'ArrayExpression',
										elements: []
									}
								]
							}
						}
					}
				]
			},
			generator: false,
			expression: false,
			async: true
		},
		kind: 'method',
		static: false
	};
}

function getModelDeleteFunction(model) {
	return {
		type: 'MethodDefinition',
		key: {
			type: 'Identifier',
			name: 'delete'
		},
		computed: false,
		value: {
			type: 'FunctionExpression',
			id: null,
			params: [],
			body: {
				type: 'BlockStatement',
				body: [
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
										type: 'MemberExpression',
										computed: false,
										object: {
											type: 'ThisExpression'
										},
										property: {
											type: 'Identifier',
											name: '_provider'
										}
									},
									property: {
										type: 'Identifier',
										name: 'deleteModels'
									}
								},
								arguments: [
									{
										type: 'Literal',
										value: model.name,
										raw: '\'' + model.name + '\''
									},
									{
										type: 'ArrayExpression',
										elements: []
									}
								]
							}
						}
					}
				]
			},
			generator: false,
			expression: false,
			async: true
		},
		kind: 'method',
		static: false
	};
}

exp.getFieldGetterAndSetter = getFieldGetterAndSetter;
exp.getModelConstructor  = getModelConstructor;
exp.getModelCreateFunction = getModelCreateFunction;
exp.getModelGetFunction = getModelGetFunction;
exp.getModelUpdateFunction = getModelUpdateFunction;
exp.getModelDeleteFunction = getModelDeleteFunction;