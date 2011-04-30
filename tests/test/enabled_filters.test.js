var assert = require('assert'), filter = require('../../index')

module.exports = {
	'autoEnabled': function() {
		assert.notEqual(filter.list().indexOf('add'), -1)
		assert.throws(function() { filter.validate('not a number', 'add') })
		assert.equal(filter.sanitize(2, 'add', {value: 3}), 5)
	},
	'manualEnabled': function() {
		filter.add('fake', {validate: function(){}})
		assert.notEqual(filter.list().indexOf('fake'), -1)
		assert.doesNotThrow(function() { filter.validate(undefined, 'fake') })
	}
}
