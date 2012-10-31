var utils = require("../../utils");

exports.plugin = function(router, loader) {
	utils.bindRouter(router, "httpServer", "accounts").once("full", function(data) {
		require("./routes").plugin(data, loader);
	});
}