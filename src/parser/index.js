const fs = require('fs');

class Parser {
	parse;
	constructor() {
		this.parse = require('./parser').parse;
	}
	parseSource(source) {
		return this.parse(source, {startRule: 'Antiprism'});
	}
	parseFile(path) {
		const file = fs.readFileSync(path);
		return this.parseSource(file.toString());
	}
}

module.exports = new Parser();