const fs = require('fs');

class Parser {
	constructor() {
		this.parse = require('./parser').parse;
	}
	parseSource(source) {
		return this.parse(source, {startRule: 'Antiprism'});
	}
	parseFile(path) {
		const file = fs.readFileSync(path);
		// console.log(typeof file);
		// console.log(file);
		return this.parseSource(file.toString());
	}
}

module.exports = Parser;