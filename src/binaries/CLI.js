const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const path = require('path');
const fs = require('fs');
const ncp = require('ncp').ncp;
ncp.limit = 16;
const browserify = require('browserify');
const parser = require('../parser');
const utils = require('../utils');
const codegen = require('../codegen');
const postgresql = require('../postgresql');

const antiprismPath = path.resolve(__dirname, '..', '..')

const sections = [
	{
		header: 'Antiprism',
		content: 'Database ORM, server/client generation'
	},
	{
		header: 'Options',
		optionList: [
			{
				name: 'input',
				typeLabel: '{underline file}',
				description: 'The input to process.'
			}
		]
	}
];
const usage = commandLineUsage(sections);

const mainDefinitions = [
	{name: 'command', defaultOption: true}
];
const mainOptions = commandLineArgs(mainDefinitions, {stopAtFirstUnknown: true});
const argv = mainOptions._unknown || [];

const definitions = [
	{name: 'input', alias: 'i', type: String, defaultOption: true},
	{name: 'output', alias: 'o', type: String}
];

if (mainOptions.command === 'parse') {
	const parseDefinitions = definitions;
	const parseOptions = commandLineArgs(parseDefinitions, {argv});
	if (!parseOptions.input) {
		console.log(usage);
		return;
	}
	const res = JSON.stringify(parser.parseFile(parseOptions.input), null, '\t');
	if (!parseOptions.output) {
		console.log(res);
	} else {
		fs.writeFileSync(parseOptions.output, res);
	}
} else if (mainOptions.command === 'generate-database') {
	const dbDefinitions = definitions.concat([
		{name: 'antiprism', alias: 'a', type: String}
	]);
	const dbOptions = commandLineArgs(dbDefinitions, {argv});
	if (!dbOptions.input && !dbOptions.antiprism) {
		console.log(usage);
		return;
	}
	let antiprism;
	if (dbOptions.antiprism) {
		antiprism = JSON.parse(fs.readFileSync(dbOptions.antiprism).toString());
		if (!utils.validateAntiprismFile(antiprism)) {
			console.log('wrong antiprism');
			return;
		}
	} else {
		if (!dbOptions.input) {
			console.log('wrong input');
			return;
		}
		antiprism = parser.parseFile(dbOptions.input);
	}
	if (antiprism.datasource.provider === 'postgresql') {
		const pg = new postgresql.PostgresqlProvider(antiprism.datasource.user, antiprism.datasource.password,
			antiprism.datasource.database, antiprism.datasource.port, antiprism.models);
		const createStrings = antiprism.models.map(m => pg.modelToInitString(m));
		pg.connect().then(res => {
			const promises = createStrings.map(c => pg.exec(c, []));
			Promise.all(promises)
				.catch(err => {
					console.log('create table err ', err);
					return 0;
				})
				.then(res => {
					return 0;
				})
				.finally(() => pg.disconnect())
				.finally(() => {
				});
		});
	} else {

	}
} else if (mainOptions.command === 'generate-client') {
	const dbDefinitions = definitions.concat([
		{name: 'antiprism', alias: 'a', type: String}
	]);
	const dbOptions = commandLineArgs(dbDefinitions, {argv});
	if (!dbOptions.input && !dbOptions.antiprism) {
		console.log(usage);
		return;
	}
	let antiprism;
	if (dbOptions.antiprism) {
		antiprism = JSON.parse(fs.readFileSync(dbOptions.antiprism).toString());
		if (!utils.validateAntiprismFile(antiprism)) {
			console.log('wrong antiprism');
			return;
		}
	} else {
		if (!dbOptions.input) {
			console.log('wrong input');
			return;
		}
		antiprism = parser.parseFile(dbOptions.input);
	}
	if (antiprism.datasource.provider === 'postgresql') {
		if (!dbOptions.output) {
			console.log(codegen(antiprism));
		} else {
			fs.writeFileSync(dbOptions.output, codegen(antiprism));
		}
	} else {

	}
} else if (mainOptions.command === 'generate') {
	const dbDefinitions = definitions.concat([
		{name: 'antiprism', alias: 'a', type: String}
	]);
	const dbOptions = commandLineArgs(dbDefinitions, {argv});
	if (!dbOptions.input && !dbOptions.antiprism) {
		console.log(usage);
		return;
	}
	let antiprism;
	if (dbOptions.antiprism) {
		antiprism = JSON.parse(fs.readFileSync(dbOptions.antiprism).toString());
		if (!utils.validateAntiprismFile(antiprism)) {
			console.log('wrong antiprism');
			return;
		}
	} else {
		if (!dbOptions.input) {
			console.log('wrong input');
			return;
		}
		antiprism = parser.parseFile(dbOptions.input);
	}
	if (!dbOptions.output) {
		console.log('output required');
		return;
	}
	fs.writeFileSync(path.resolve(dbOptions.output, 'config.json'), JSON.stringify(antiprism, null, '\t'));
	fs.writeFileSync(dbOptions.output + '/client.js', codegen.generateClient(antiprism, false));
	new Promise((resolve, reject) => {
		ncp(path.resolve(antiprismPath, 'src', 'server', 'frontend'), path.resolve(dbOptions.output, 'frontend'), resolve)
	}).then(err => {
		if (err) {
			console.log('copy err', err);
			return null;
		}
		fs.writeFileSync(path.resolve(dbOptions.output, 'frontend', 'config.json'), JSON.stringify(antiprism, null, '\t'));
		antiprism.datasource.provider = 'http';
		fs.writeFileSync(path.resolve(dbOptions.output, 'frontend', 'web-client.js'),
			fs.readFileSync(path.resolve(antiprismPath, 'src', 'db', 'index.js')) + '\n' +
			fs.readFileSync(path.resolve(antiprismPath, 'src', 'web', 'web.js')) + '\n' +
			codegen.generateClient(antiprism, true));
		fs.writeFileSync(path.resolve(dbOptions.output, 'server.js'), codegen.generateServer(antiprism));
	}).catch(() => {
		console.log('copy err')
	});
} else {
	console.log(usage);
}
