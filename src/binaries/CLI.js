const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const path = require('path');
const fs = require('fs');
const ncp = require('ncp').ncp;
ncp.limit = 16;
const parser = require('../parser');
const utils = require('../utils');
const codegen = require('../codegen');
const postgresql = require('../postgresql');

const antiprismPath = path.resolve(__dirname, '..', '..');

const optionDefinitions = [
	{
		name: 'input',
		alias: 'i',
		type: String,
		typeLabel: '{underline file}',
		defaultOption: true,
		description: 'The input to process.'
	},
	{
		name: 'output',
		alias: 'o',
		type: String,
		typeLabel: '{underline file} or {underline dir}',
		description: 'Output file or dir'
	},
	{
		name: 'antiprism',
		alias: 'a',
		type: String,
		typeLabel: '{underline antiprism file}',
		description: 'Antiprism config file'
	}
];

const sections = [
	{
		header: 'Antiprism',
		content: 'Database ORM, server/client generation'
	},
	{
		header: 'Synopsis',
		content: '$ app <options> <command>'
	},
	{
		header: 'Command List',
		content: [
			{
				name: 'help',
				summary: 'Display this'
			},
			{
				name: 'config',
				summary: 'Process antiprism file from antiprism scheme'
			},
			{
				name: 'database',
				summary: 'insert models into database'
			},
			{
				name: 'client',
				summary: 'generate Node client'
			},
			{
				name: 'web-client',
				summary: 'generate web client script'
			},
			{
				name: 'web',
				summary: 'generate Node client'
			},
			{
				name: 'generate',
				summary: 'generate everything'
			},
			{
				name: 'image',
				summary: 'make docker image'
			}
		]
	},
	{
		header: 'Options',
		optionList: optionDefinitions
	}
];

const usage = commandLineUsage(sections);

const mainDefinitions = [
	{name: 'command', defaultOption: true}
];
const mainOptions = commandLineArgs(mainDefinitions, {stopAtFirstUnknown: true});
const argv = mainOptions._unknown || [];

function generateConfig(input) {
	const cfg = parser.parseFile(input);
	utils.validateAntiprismFile(cfg);
	utils.postProcessAntiprism(cfg);
	return cfg;
}

function generateDatabase(provider, cfg) {
	const createStrings = cfg.models.map(m => provider.modelToInitString(m));
	provider.connect().then(res => {
		const promises = createStrings.map(c => provider.exec(c, []));
		Promise.all(promises)
			.catch(err => {
				console.log('create table err ', err);
				return 0;
			})
			.then(res => {
				return 0;
			})
			.finally(() => provider.disconnect())
			.finally(() => {
			});
	});
}

function cfgOrInput(opts) {
	if (!opts.input && !opts.antiprism) {
		console.log(usage);
		return;
	}
	let cfg;
	if (opts.antiprism) {
		cfg = JSON.parse(fs.readFileSync(opts.antiprism).toString());
	} else {
		cfg = generateConfig(opts.input);
	}
	return cfg;
}

function generate(parseOptions, cfg) {
	const clientCode = codegen.generateClient(cfg);
	const webClientCode = codegen.generateClient(cfg, true);
	fs.writeFileSync(path.resolve(parseOptions.output, 'config.json'), JSON.stringify(cfg, null, '\t'));
	fs.writeFileSync(parseOptions.output + '/client.js', clientCode);
	new Promise((resolve, reject) => {
		ncp(path.resolve(antiprismPath, 'src', 'server', 'frontend'), path.resolve(parseOptions.output, 'frontend'), resolve)
	}).then(err => {
		if (err) {
			console.log('copy err', err);
			return null;
		}
		fs.writeFileSync(path.resolve(parseOptions.output, 'frontend', 'config.json'), JSON.stringify(cfg, null, '\t'));
		fs.copyFileSync(path.resolve(antiprismPath, 'src', 'web', 'antiprism.js'), path.resolve(parseOptions.output, 'frontend', 'antiprism.js'));
		cfg.datasource.provider = 'http';
		fs.writeFileSync(path.resolve(parseOptions.output, 'frontend', 'web-client.js'), webClientCode);
		fs.writeFileSync(path.resolve(parseOptions.output, 'server.js'), codegen.generateServer(cfg));
	}).catch((err) => {
		console.log('catch', err);
	});
}

const parseOptions = commandLineArgs(optionDefinitions, {argv});

if (mainOptions.command === 'config') {
	if (!parseOptions.input) {
		console.log(usage);
		return;
	}
	const cfg = generateConfig(parseOptions.input);
	if (!parseOptions.output) {
		console.log(cfg);
	} else {
		fs.writeFileSync(parseOptions.output, cfg);
	}
} else if (mainOptions.command === 'database') {
	const cfg = cfgOrInput(parseOptions);
	if (cfg.datasource.provider === 'postgresql') {
		const pg = new postgresql.PostgresqlProvider(cfg.datasource.user, cfg.datasource.password,
			cfg.datasource.database, cfg.datasource.port, cfg.models);
		generateDatabase(pg, cfg);
	}
} else if (mainOptions.command === 'client') {
	const cfg = cfgOrInput(parseOptions);
	const clientCode = codegen.generateClient(cfg);
	if (!parseOptions.output) {
		console.log(clientCode);
	} else {
		fs.writeFileSync(parseOptions.output, clientCode);
	}
} else if (mainOptions.command === 'web-client') {
	const cfg = cfgOrInput(parseOptions);
	const clientCode = codegen.generateClient(cfg, true);
	if (!parseOptions.output) {
		console.log(clientCode);
	} else {
		fs.writeFileSync(parseOptions.output, clientCode);
	}
} else if (mainOptions.command === 'generate') {
	if (!parseOptions.output) {
		console.log('output required');
		return;
	}
	const cfg = cfgOrInput(parseOptions);
	if (cfg.datasource.provider === 'postgresql') {
		const pg = new postgresql.PostgresqlProvider(cfg.datasource.user, cfg.datasource.password,
			cfg.datasource.database, cfg.datasource.port, cfg.models);
		generateDatabase(pg, cfg);
	}
	generate(parseOptions, cfg);
} else if (mainOptions.command === 'web') {
	if (!parseOptions.output) {
		console.log('output required');
		return;
	}
	const cfg = cfgOrInput(parseOptions);
	generate(parseOptions, cfg);
} else if (mainOptions.command === 'image') {
	console.log('docker unimplemented');
} else if (mainOptions.command === 'help') {
	console.log(usage);
} else {
	console.log(usage);
}
