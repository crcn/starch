var structr = require("structr"),
Sanitizers  = require("./sanitizers"),
Matchers    = require("./matchers"),
Siblings    = require("./siblings"),
validator = require("validator"),
check = validator.check;

module.exports = structr({

	/**
	 */

	"__construct": function(options) {
		this._testers    = options.testers;
		this.name        = options.name;
		this._message    = options.message;

		this._sanitizers = new Sanitizers();
		this._is         = new Matchers(this._testers);
		this._not        = new Matchers(this._testers);

		this._registerValidator("equals", "contains", "len", "isUUID", "isBefore", "isAfter", "isIn", "notIn", "max", "min");
	},

	/**
	 */

	"message": function(value) {
		if(arguments.length === 0) return this._message;
		this._message = value;
		return this;
	},

	/**
	 */

	"is": function(test) {
		this._is.add(test);
		return this;
	},

	/**
	 */

	"not": function(test) {
		this._not.add(test);
		return this;
	},

	/**
	 */

	"addSanitizer": function(match, sanitizer) {
		this._sanitizers.add(match, sanitizer);
		return this;
	},

	/**
	 */

	"test": function(value) {
		return !!value && this._is.test(value) && !this._not.test(value);
	},

	/**
	 */

	"sanitize": function(value) {
		var newValue = this._is.sanitize(value);
		return this._sanitizers.sanitize(newValue);
	},


	/**
	 */

	"_registerValidator": function() {
		var keys = Array.prototype.slice.call(arguments, 0), 
		self = this;
		keys.forEach(function(key) {
			self[key] = function() {
				var args = arguments;
				self.is(function(value) {
					try {
						var chain = check(value);
						chain[key].apply(chain, args);
						return true;
					} catch(e) {
						return false;
					}
				});
			}
		});
	}
});