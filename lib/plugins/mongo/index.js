var mongoose        = require("mongoose"),
getConnectionString = require("./getConnectionString");

exports.plugin = function(router, loader) {

	var db;

		
	router.on({

		/**
		 */

		"pull load/+": function(req, res, mw) {
			router.push("database", db = mongoose.createConnection(getConnectionString(loader.params("mongo"))));
			mw.next();
		},

		/**
		 */

		"push init": function() {
		}
	});
}


function getConnectionString(options) {
	
}