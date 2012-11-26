var Plans = require("./plans");

exports.require = ["stripe.init"];
exports.plugin = function(stripe, loader) {

	var plans = new Plans(stripe, loader.params("starch.plans"));


}