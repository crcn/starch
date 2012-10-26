var Payments = require("./payments"),
database     = require("./database"),
Users        = require("./users"),
_            = require("underscore");

//register
require("./models");


exports.start = function(options) {
	var db = database.connect(options.mongo),
	ns = {
		database: db
	};

	_.extend(ns, {
		users: new Users(ns)
	}); 
}