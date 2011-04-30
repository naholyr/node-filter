/*

Format of a fully described filter:

{
	"description": "description of the filter, used by help()", // Optional
	"callback":    validation_function,
	"options":     { // Optional
		// List of available options, with the following formats
		"option's name": {
			"description": "description of the option, used by help()", // Optional
			"default": default_value // Optional
		}…
	}
}

*/

// private
var filters = {};

// Load default filters: look at a module "enabled_filters" which should return the base filters
// Looked in module's directory + current working directory
load_filters_from_module(__dirname + '/enabled_filters');
if (__dirname != process.cwd()) {
	load_filters_from_module(process.cwd() + '/enabled_filters');
}
function load_filters_from_module(module_name)
{
	try {
		var module = require(module_name);
		if (typeof module != 'object') {
			console.info('Module "' + module_name + '" should be an object {"filter_name":"filter"}');
		} else {
			for (var filter_name in module) {
				try {
					filter_add(filter_name, module[filter_name]);
				} catch (e) {
					console.info('Failed loading filter "' + filter_name + '": ' + e);
				}
			}
		}
	} catch (e) {
		console.info('Failed loading module "' + module_name + '": ' + e);
	}
}


/**
 *
 */
function filter_add(name, filter, options)
{
	var overwritten = typeof filters[name] != 'undefined';

	// Usage: (name, callback [, options])
	if (typeof filter == 'function') {
		filter = {
			'callback': filter,
			'options':  options,
		};
	}

	// Usage: (name, module_name [, options])
	else if (typeof filter == 'string') {
		// The module should return an object or a function
		return filter_add(name, require(filter), options);
	}

	// Usage: (name, {"callback":… [, "options":…]} [, options])
	else if (typeof filter == 'object') {
		if (typeof filter.callback == 'undefined') {
			throw new Error("Invalid filter: required field 'callback'");
		}
		if (typeof filter.options == 'undefined') {
			filter.options = options;
		}
	}

	filters[name] = filter;

	return !overwritten;
}

/**
 *
 */
function filter_list()
{
	var filter_names = [];
	for (var name in filters) {
		filter_names.push(name);
	}

	return filter_names;
}

/**
 *
 */
function filter_help(name)
{
	if (typeof name == 'undefined') {
		throw new Error('Specify the filter you need help about, one of ' + filter_list());
	}

	if (!filters[name]) {
		throw new Error('Invalid filter. Choose one of ' + filter_list());
	}

	console.info('Help for filter ' + name + ':');

	var filter = filters[name];
	console.info('| ' + (filter.description || 'No description available.'));
	if (!filter.options) {
		console.info('| This filter takes no option.');
	} else {
		console.info('| Options:');
		for (var option in filter.options) {
			var d = filter.options[option].description;
			console.info('|  * ' + option + ': ' + (filter.options[option].description || 'No description') + ' (default value = ' + (filter.options[option].default || 'null') + ')');
		}
	}
}

/**
 *
 */
function filter_validate()
{
	throw new Error('Not Implemented Yet');
}

/**
 *
 */
function filter_sanitize()
{
	throw new Error('Not Implemented Yet');
}


module.exports = {
	'add':      filter_add,
	'list':     filter_list,
	'help':     filter_help,
	'validate': filter_validate,
	'sanitize': filter_sanitize
};
