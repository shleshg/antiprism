const escodegen = require('escodegen');

const providers = {
	'postgresql': 'Postgresql'
};

const ObjectExpression = 'ObjectExpression';

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
				property.value = modelToAst(model[prop]);
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
																					name: 'antiprism'
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
								modelToAst(model)
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
												name: 'antiprism'
											},
											property: {
												type: 'Identifier',
												name: providers[antiprism.datasource.provider] + 'Provider'
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

module.exports = function (antiprism) {
	const provider = antiprism.datasource.provider;
	const toCode = {
		type: 'Program',
		body: [
			requireStatement('antiprism', 'antiprism')
		]
	};
	toCode.body.push(
		...antiprism.models.map(m => {
			const params = getModelParams(m);
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
						name: providers[provider] + 'Model'
					}
				},
				body: {
					type: 'ClassBody',
					body: [
						getModelConstructor(m, params),
						getModelCreateFunction(m, params),
						getModelGetFunction(m, params),
						getModelUpdateFunction(m),
						getModelDeleteFunction(m),
						...params.flatMap(getFieldGetterAndSetter)
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
		...antiprism.models.map(m => getModelExport(m.name))
	);
	toCode.body.push(getModelProvider(antiprism));
	return escodegen.generate(toCode);
};