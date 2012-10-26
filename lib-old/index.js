
var http = require("./http"),
core     = require("./core");

exports.start = function(options) {
	core.start(options);
	http.start(null, options.http);
}