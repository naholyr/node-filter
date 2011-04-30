var filters = {};

var fs = require('fs');
fs.readdirSync(__dirname).forEach(function(file) {
	if (file == 'index.js') {
		return false;
	}
	var file_path = __dirname + '/' + file;
	var filter_name = file.replace(/\.js$/, '');
	try {
		filters[filter_name] = require(file_path);
	} catch (e) {
		console.info('Failed loading filter "' + filter_name + '": ' + e);
	}
});

module.exports = filters;
