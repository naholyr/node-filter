Usage
=====

    var filter = require('filter')

Validation
----------

    // Synchronous
    try {
      filter.validate('hello', 'string', {'min': 10})
      console.log('Valid')
    } catch (e) {
      console.log('Invalid', e.message) // → "Invalid", "too short"
    }

    // Asynchronous
    filter.validate('hello', 'string', {'min': 10}, function(err, value) {
      if (!err) {
        console.log('Valid')
      } else {
        console.log('Invalid', err.message) // → "Invalid", "too short"
      }
    })

Sanitization
------------

    // Synchronous
    try {
      console.log(filter.sanitize('hello', 'string', {'min': 10})) // → "hello     "
    } catch (e) {
      console.log('Failed')
    }

    // Asynchronous
    filter.sanitize('hello', 'string', {'min': 10}, function(err, value, original) {
      if (err) {
        console.log('Failed')
      } else {
        console.log(value) // → "hello     "
      }
    })

Help
----

    filter.help('string')

will output:

    Help for filter string:
    |    Standard string validations
    | Options:
    |  * min: Minimum length (default value = 0)
    |  * max: Maximum length (default value = null)
    |  * pattern: Regexp that should be matched (default value = null)
    |  * replace: Replacement for given pattern, used for sanitization only (default value = null)

Available filters
=================

noop
----

This filter just does nothing. It always validates, and sanitization always returns original value.

This filter takes no option.

string
------

This filter will be used to validate and cleanup strings.

*Available options*:

* **min**: Minimum length (default value = 0)
* **max**: Maximum length (default value = null)
* **pattern**: Regexp that should be matched (default value = null)
* **replace**: Replacement for given pattern, used for sanitization only (default value = null)

email
-----

TODO

url
---

TODO

number
------

TODO

Add your own filters
====================

Create a filter
---------------

The simpliest way is to declare your filter as a module:

    module.exports = {
      description: "Description of your filter, used by help()", // Optional
      validate:    function(value, options) { /* Throws an error if value is not valid. Optionnally returns sanitized value */ },
      sanitize:    function(value, options) { /* Returns sanitized value */ }, // Optional, if not present 'validate' will be used
      options:     {
        my_option: { description: "Description of this option, used by help()", default: default_value },
        …
      }
    }

How options work
----------------

Suppose you declared your filter this way:

    {
      validate: function() { return true; /* this filter does not make validations */ },
      sanitize: function(value, options) { return value + options.added },
      options:  { added: { default: 0 } }
    }

It will be used this way:

    var filter = require('filter')
    console.log(filter.sanitize(3, {added: 4})) // → 7

*Note*:

* Calling a filter with options it did not declare will raise an error.
* If an option is not provided, your callback will get its default value (null if none was specified).

Use your filter
---------------

You can add your filter directly:

    filter.add('my_filter', { … })

If you wrote it as a module, you can use the module's name:

    filter.add('my_filter', './my_filter_module')

But you could prefer to let the filters declare themselves:

* Create a module named <code>enabled_filters</code> in current working directory.
* This module will return a list of your own filters, format <code>{ name: filter }</code>.

For example, you could have this structure:

    ./
     +- app.js
     +- enabled_filters.js → module.exports = { my_filter: './my_custom_filter' }
     +- my_custom_filter.js → module.exports = { … }

This way, no need to call <code>filter.add(…)</code>, it's automatically done when module <code>filter</code> is loaded.
