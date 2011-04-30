exports.description = "Standard string validations";

exports.options = {
	"min":     { "description": "Minimum length", "default": 0 },
	"max":     { "description": "Maximum length" },
	"pattern": { "description": "Regexp that should be matched" },
	"replace": { "description": "Replacement for given pattern, used for sanitization only" }
};

var validate = exports.validate = function (value, options)
{
	if (typeof value != 'string') {
		throw new Error('String expected');
	}
	if (options.min !== null && value.length < options.min) {
		throw new Error('String should be at least ' + options.min + ' characters long');
	}
	if (options.max !== null && value.length > options.max) {
		throw new Error('String should be at most ' + options.max + ' characters long');
	}
	if (options.pattern != null && !value.match(options.pattern)) {
		throw new Error('String should match pattern ' + pattern);
	}
};

exports.sanitize = function (value, options)
{
	if (options.pattern !== null && options.replace !== null) {
		value = value.replace(options.pattern, options.replace);
	}
	if (options.min !== null) {
		while (value.length < options.min) {
			value += ' ';
		}
	}
	if (options.max !== null) {
		value = value.substring(0, options.max);
	}

	return value;
};
