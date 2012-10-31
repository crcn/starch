var mongoose        = require("mongoose"),
getConnectionString = require("./getConnectionString");

exports.plugin = function(router, loader) {

	console.log(loader.parmas)
	router.on({
		"pull load/+": function(req, res, mw) {
			router.push("database", mongoose.createConnection(getConnectionString(loader.params("mongo"))));
			mw.next();
		}
	});
}


function getConnectionString(options) {
	
}