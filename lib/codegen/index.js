const escodegen = require('escodegen');

const providers = {
	'postgresql': 'Postgresql'
};

module.exports = function (antiprism) {
	const provider = antiprism.datasource.provider;
	const toCode = {
		type: 'Program',
		body: [
			{
				type: 'VariableDeclaration',
				declarations: [
					{
						type: 'VariableDeclarator',
						id: {
							type: 'Identifier',
							name: antiprism.datasource.provider
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
									value: '../' + provider,
									raw: '\'../' + provider + '\''
								}
							]
						}
					}
				],
				kind: 'const'
			}
		]
	};
	toCode.body.push(
		...antiprism.models.map(m => {
			return {
				type: 'ClassDeclaration',
				id: {
					type: 'Identifier',
					name: m.name
				},
				superClass: {
					type: 'Identifier',
					name: provider + '.' + providers[provider] + 'Model'
				},
				body: {
					type: 'ClassBody',
					body: [
						{
							type: 'MethodDefinition',
							key: {
								type: 'Identifier',
								name: 'constructor'
							},
							computed: false,
							value: {
								type: 'FunctionExpression',
								id: null,
								params: [],
								body: {
									type: 'BlockStatement',
									body: []
								},
								generator: false,
								expression: false,
								async: false
							},
							kind: 'constructor',
							static: false
						}
					]
				}
			}
		})
	);
	return escodegen.generate(toCode);
};