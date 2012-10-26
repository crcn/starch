dials = require("dials");

var loader = require("beanie")().
require(__dirname + "/plugins").
params(dials.load({
	developmentPath: __dirname + "/config"
}).get()).
load();
