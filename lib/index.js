var mongoose = require("mongoose");


var loader = require("beanie")().
require(__dirname + "/plugins").
params({
	"mongo": {
		host: "localhost",
		database: "starch-test"
	},
	"http": {
		port: 8080
	}
}).
load();


console.log(loader.exports);