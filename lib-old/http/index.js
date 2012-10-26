var express = require("express"),
stylus      = require("stylus"),
browserify  = require("browserify"),
browserifyFiles = require("browserify-files");

exports.start = function(core, options) {

	var server = express();

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

	server.get("/", function(req, res) {
		res.render("index");
	});


	server.all("/stripe/event", function(req, res) {
		console.log(req.body);

		//core.payments.emit(req)
		res.end();
	});

	server.post("/payment", function(req, res) {

		var body = req.body;

		//core.users.signup(body, function(err, result) {

		//})

		res.end();
	})



	server.listen(options.port);
}


function handlebarsTemplate() {
	return "Ember.Handlebars.compile(\"{{{body}}}\");"
}