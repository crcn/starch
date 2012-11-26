var stripe = require("stripe");

exports.plugin = function(router, loader) {

	var app;

	router.on({
		"pull load/+": function(req, res, mw) {
			router.push("stripe", app = stripe(loader.params("stripe.apiKey")));
			mw.next();
		}
	})
}