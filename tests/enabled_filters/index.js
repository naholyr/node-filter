module.exports = {
	add: {
		validate: function(value) { if (typeof value != 'number') throw new Error('Number expected') },
		sanitize: function(value, options) { return value + options.value },
		options:  { value: { default: 0 } }
	}
}
