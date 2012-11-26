var express = require("express"),
stylus      = require("stylus"),
browserify  = require("browserify"),
browserifyFiles = require("browserify-files"),
logger = require("winston").loggers.get("website");

exports.plugin = function(options, loader) {

	logger.info("starting up website");

	var server = options.httpServer,
	accounts   = options.accounts;

	exports.pluginMiddleware(server, loader);

	server.get("/", function(req, res) {
		res.render("index");
	});

	server.post("/payment", function(req, res) {

		var body = req.body;

		logger.info("account signup");

		accounts.signup(body, function(err, result) {
			if(err) logger.error(err);
		})

		res.end();
	})

}



exports.pluginMiddleware = function(server) {
	server.set("views", __dirname + "/views");
	server.set("view engine", "jade");
	server.use(stylus.middleware({ src: __dirname + "/public" }));

	var b = browserify({ mount: "/js/index.js", cache: true, watch: true });
	browserifyFiles.register(["hb"], handlebarsTemplate, b);
	b.addEntry(__dirname + "/public/js/index.js");
	server.use(b);
	server.use(express.static(__dirname + "/public"));
	server.use(express.errorHandler());
	server.use(express.bodyParser());
}


function handlebarsTemplate() {
	return "Ember.Handlebars.compile(\"{{{body}}}\");"
}