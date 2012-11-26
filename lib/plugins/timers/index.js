var Timer = require("./timer");

exports.plugin = function() {

	return {
		daily: new Timer("0 0 * * *"),
		weekly: new Timer("0 0 * * 0"),
		monthly: new Timer("0 0 1 * *"),
		yearly: new Timer("0 0 1 1 *")
	};
}