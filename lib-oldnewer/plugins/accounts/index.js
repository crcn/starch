var Delegate = require("./delegate"),
utils        = require("../../utils");

exports.plugin = function(router, loader) {
	utils.bindRouter(router, "stripe", "database", "referals").once("full", function(data) {
		router.push("accounts", new Delegate(data));
	});
}