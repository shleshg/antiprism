const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const parser = require('../parser');
const fs = require('fs');

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
	const p = new parser();
	const res = JSON.stringify(p.parseFile(parseOptions.input), null, '\t');
	if (!parseOptions.output) {
		console.log(res);
	} else {
		fs.writeFileSync(parseOptions.output, );
	}
} else if (mainOptions.command === 'generate') {

} else {
	console.log(usage);
}