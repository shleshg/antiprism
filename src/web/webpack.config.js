module.exports = {
	entry: './index.js',
	output: {
		path: __dirname,
		filename: 'antiprism.js',
		libraryTarget: 'var',
		library: 'antiprism'
	}
};