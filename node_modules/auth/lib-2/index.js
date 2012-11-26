var schemas  = require("./schemas"),
Auth         = require("./auth");

exports.init = function(options) {
	return new Auth(options);
}