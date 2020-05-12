const util = require('./util');
const exp = module.exports;

function getFieldGetterAndSetter(providerName, name) {
	return [
		{
			type: 'MethodDefinition',
			key: util.Identfier(name),
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
									property: util.Identfier('_value')
								},
								property: util.Identfier(name)
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
			key: util.Identfier(name),
			computed: false,
			value: {
				type: 'FunctionExpression',
				id: null,
				params: [
					util.Identfier(name)
				],
				body: {
					type: 'BlockStatement',
					body: [
						{
							type: 'ReturnStatement',
							argument: {
								type: 'NewExpression',
								callee: util.Identfier('Promise'),
								arguments: [
									{
										type: 'ArrowFunctionExpression',
										id: null,
										params: [
											util.Identfier('resolve'),
											util.Identfier('reject')
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
																property: util.Identfier('update')
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
																				object: util.Identfier('antiprism'),
																				property: util.Identfier('SetParameter')
																			},
																			arguments: [
																				{
																					type: 'MemberExpression',
																					computed: false,
																					object: {
																						type: 'ThisExpression'
																					},
																					property: util.Identfier('_provider')
																				},
																				util.Literal(name),
																				util.Identfier(name)
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
														callee: util.Identfier('resolve'),
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

function dateConstructing(model, params) {
	const toConstruct = [];
	let ind = 0;
	for (const prop in model.fields) {
		if (model.fields[prop].typeName === 'DateTime') {
			toConstruct.push(ind);
		}
		ind++;
	}
	return toConstruct.map(d => {
		return {
			type: 'IfStatement',
			test: util.Identfier(params[d]),
			consequent: {
				type: 'ExpressionStatement',
				expression: {
					type: 'AssignmentExpression',
					operator: '=',
					left: util.Identfier(params[d]),
					right: {
						type: 'NewExpression',
						callee: util.Identfier('Date'),
						arguments: [util.Identfier(params[d])]
					}
				}
			}
		}
	})
}

function getModelConstructor(providerName, model, params) {
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
					...dateConstructing(model, params),
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
											type: 'ConditionalExpression',
											test: {
												type: 'BinaryExpression',
												operator: '===',
												left: util.Identfier(p),
												right: util.Identfier('undefined')
											},
											consequent: util.Literal(null),
											alternate: util.Identfier(p)

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

function getModelCreateFunction(providerName, model, params) {
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
													name: 'antiprism'
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

function getModelGetFunction(providerName, model, params) {
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

function getModelUpdateFunction(providerName, model) {
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
										type: 'CallExpression',
										callee: {
											type: 'MemberExpression',
											computed: false,
											object: {
												type: 'ThisExpression'
											},
											property: util.Identfier('identWhereParams')
										},
										arguments: []
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
								type: 'MemberExpression',
								computed: false,
								object: {
									type: 'ThisExpression'
								},
								property: util.Identfier('applySets')
							},
							arguments: [
								util.Identfier('sets')
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
		static: false
	};
}

function getModelDeleteFunction(providerName, model) {
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
										type: 'CallExpression',
										callee: {
											type: 'MemberExpression',
											computed: false,
											object: {
												type: 'ThisExpression'
											},
											property: util.Identfier('identWhereParams')
										},
										arguments: []
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

function getApplySets() {
	return {
		type: 'MethodDefinition',
		key: util.Identfier('applySets'),
		computed: false,
		value: {
			type: 'FunctionExpression',
			id: null,
			params: [
				util.Identfier('sets')
			],
			body: {
				type: 'BlockStatement',
				body: [
					{
						type: 'ExpressionStatement',
						expression: {
							type: 'CallExpression',
							callee: {
								type: 'MemberExpression',
								computed: false,
								object: util.Identfier('sets'),
								property: util.Identfier('map')
							},
							arguments: [
								{
									type: 'ArrowFunctionExpression',
									id: null,
									params: [
										util.Identfier('s')
									],
									body: {
										type: 'BlockStatement',
										body: [
											{
												type: 'ExpressionStatement',
												expression: {
													type: 'AssignmentExpression',
													operator: '=',
													left: {
														type: 'MemberExpression',
														computed: true,
														object: {
															type: 'MemberExpression',
															computed: false,
															object: {
																type: 'ThisExpression'
															},
															property: util.Identfier('_value')
														},
														property: {
															type: 'MemberExpression',
															computed: false,
															object: util.Identfier('s'),
															property: util.Identfier('name')
														}
													},
													right: {
														type: 'MemberExpression',
														computed: false,
														object: util.Identfier('s'),
														property: util.Identfier('value')
													}
												}
											}
										]
									}
								}
							]
						}
					},
				]
			}
		}
	}
}

function getIdentWhereParams(model, params) {
	if (model.pk && model.pk.length !== 0) {
		params = model.pk;
	} else if (model.indices && model.indices.length !== 0) {
		params = model.indices[0].fields;
	}
	const conds = params.map(p => {
		return {
			type: 'NewExpression',
			callee: {
				type: 'MemberExpression',
				computed: false,
				object: util.Identfier('antiprism'),
				property: util.Identfier('WhereCondition')
			},
			arguments: [
				{
					type: 'MemberExpression',
					computed: false,
					object: {
						type: 'ThisExpression'
					},
					property: util.Identfier('_provider')
				},
				util.Literal('binary'),
				util.Literal('=='),
				{
					type: 'ArrayExpression',
					elements: [
						{
							type: 'ObjectExpression',
							properties: [
								{
									type: 'Property',
									key: util.Identfier('type'),
									computed: false,
									value: util.Literal('Field')
								},
								{
									type: 'Property',
									key: util.Identfier('value'),
									computed: false,
									value: util.Literal(p)
								}
							]
						},
						{
							type: 'ObjectExpression',
							properties: [
								{
									type: 'Property',
									key: util.Identfier('type'),
									computed: false,
									value: util.Literal('Literal')
								},
								{
									type: 'Property',
									key: util.Identfier('value'),
									computed: false,
									value: {
										type: 'MemberExpression',
										computed: false,
										object: {
											type: 'ThisExpression',
										},
										property: util.Identfier(p)
									}
								}
							]
						}
					]
				}
			]
		}
	});
	return {
		type: 'MethodDefinition',
		key: util.Identfier('identWhereParams'),
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
						argument: params.length === 1 ? conds[0] : conds.slice(1).reduce((prev, current) => {
							return {
								type: 'NewExpression',
								callee: {
									type: 'MemberExpression',
									computed: false,
									object: util.Identfier('antiprism'),
									property: util.Identfier('WhereCondition')
								},
								arguments: [
									{
										type: 'MemberExpression',
										computed: false,
										object: {
											type: 'ThisExpression'
										},
										property: util.Identfier('_provider')
									},
									util.Literal('binary'),
									util.Literal('&&'),
									{
										type: 'ArrayExpression',
										elements: [
											current,
											prev
										]
									}
								]
							}
						}, conds[0])
					}
				]
			}
		}
	};
}

exp.getFieldGetterAndSetter = getFieldGetterAndSetter;
exp.getModelConstructor = getModelConstructor;
exp.getModelCreateFunction = getModelCreateFunction;
exp.getModelGetFunction = getModelGetFunction;
exp.getModelUpdateFunction = getModelUpdateFunction;
exp.getModelDeleteFunction = getModelDeleteFunction;
exp.getApplySets = getApplySets;
exp.getIdentWhereParams = getIdentWhereParams;