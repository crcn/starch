var stripe = require("stripe");
exports.plugin = function(loader) {
	return stripe(loader.params("starch.stripe.apiKey"));
}