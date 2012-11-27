var browserify = require("browserify"),
step = require("step"),
browserify = require("browserify"),
browserifyFiles = require("browserify-files"),
fs = require("fs");

exports.require = ["plugin-express", "plans"];
exports.plugin = function(httpServer, plans, loader) {
	var browserDir = __dirname + "/../../../browser";


	plans.getPlans(function(err, plans) {

		fs.writeFileSync(browserDir + "/stripeKey.js", "module.exports = '"+loader.params("starch.stripe.publicKey")+"'; ");
		fs.writeFileSync(browserDir + "/plans.js", "module.exports = "+JSON.stringify(plans, null, 2)+";");

		var b = browserify({ mount: "/starch.js", cache: false, watch: true });
		browserifyFiles.register(["ejs"], ejsTemplate, b);
		b.addEntry(browserDir + "/index.js");
		httpServer.use(b);	
	})
	
	
}

function ejsTemplate() {
	return "_.template(\"{{{body}}}\");";
}