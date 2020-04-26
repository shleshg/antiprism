const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const fs = require('fs');
const parser =  require('../parser');
const utils = require('../utils');
const postgres = require('../postgres');

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
		const pg = new postgres.PostgresProvider(antiprism.datasource.user, antiprism.datasource.password,
			antiprism.datasource.database, antiprism.datasource.port);
		const createStrings = antiprism.models.map(m => pg.modelToInitString(m));
	} else {

	}
} else if (mainOptions.command === 'generate-client') {

} else if (mainOptions.command === 'generate') {

} else {
	console.log(usage);
}
