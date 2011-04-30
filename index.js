/*

Format of a fully described filter:

{
	"description": "description of the filter, used by help()", // Optional
	"validate":    validation_function,                         // Mandatory
	"sanitize":    sanitization_function,                       // Optional, default callback is used if not defined
	"options":     {                                            // Optional
		// List of available options, with the following formats
		"option's name": {
			"description": "description of the option, used by help()", // Optional
			"default":     default_value                                // Optional
		},
		…
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
			'validate': filter,
			'options':  options,
		};
	}

	// Usage: (name, module_name [, options])
	else if (typeof filter == 'string') {
		// The module should return an object or a function
		return filter_add(name, require(filter), options);
	}

	// Usage: (name, {"validate":… [, "options":…]} [, options])
	else if (typeof filter == 'object') {
		if (typeof filter.validate == 'undefined') {
			throw new Error("Invalid filter: required field 'validate'");
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

	var filter = get_filter(name);

	console.info('Help for filter ' + name + ':');
	var filter_description = filter.description || 'No description \navailable';
	var filter_description_lines = filter_description.split('\n');
	for (var i=0; i<filter_description_lines.length; i++) {
		console.info('|    ' + filter_description_lines[i]);
	}
	if (!filter.options) {
		console.info('| This filter takes no option.');
	} else {
		console.info('| Options:');
		for (var option in filter.options) {
			var description = filter.options[option].description;
			var default_val = filter.options[option].default;
			if (typeof default_val == 'undefined') {
				default_val = null;
			}
			console.info('|  * ' + option + ': ' + (description || 'No description') + ' (default value = ' + JSON.stringify(default_val) + ')');
		}
	}
}

/**
 *
 */
function get_filter(filter)
{
	if (typeof filter == 'object') {
		return filter;
	}

	if (!filters[filter]) {
		throw new Error('Unknown filter "' + filter + '". Known filters: ' + filter_list());
	}

	return filters[filter];
}

/**
 *
 */
function get_filled_options(filter, options)
{
	filter = get_filter(filter);
	var opts = {};
	for (var option in filter.options) {
		opts[option] = filter.options[option].default || null;
	}
	for (var option in options) {
		if (typeof opts[option] == 'undefined') {
			throw new Error('Invalid option "' + option + '" for filter "' + name + '"');
		}
		opts[option] = options[option];
	}

	return opts;
}

/**
 *
 */
function filter_validate(value, filter, options, callback)
{
	filter = get_filter(filter, options);
	options = get_filled_options(filter, options);

	if (typeof callback == 'undefined') {
		filter.validate(value, options);
	} else {
		setTimeout(function() {
			var err = undefined;
			try {
				filter.validate(value, options);
			} catch (e) {
				err = e;
			}
			callback(err, value);
		}, 0);
	}
}

/**
 *
 */
function filter_sanitize(value, filter, options, callback)
{
	filter = get_filter(filter, options);
	options = get_filled_options(filter, options);

	if (typeof callback == 'undefined') {
		return (filter.sanitize || filter.validate)(value, options);
	} else {
		setTimeout(function() {
			var err = undefined, sanitized = undefined;
			try {
				sanitized = (filter.sanitize || filter.validate)(value, options);
			} catch (e) {
				err = e;
			}
			callback(err, sanitized, value);
		}, 0);
	}
}


module.exports = {
	'add':      filter_add,
	'list':     filter_list,
	'help':     filter_help,
	'validate': filter_validate,
	'sanitize': filter_sanitize
};
