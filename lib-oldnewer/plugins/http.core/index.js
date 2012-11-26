var express = require("express"),
beanpollConnect = require("beanpoll-connect");

exports.plugin = function(router, loader) {

	var server;

	router.on({
		"pull load/+": function(req, res, mw) {
			server = express();
			server.use(beanpollConnect.middleware(router));
			server.listen(loader.params("http.port") || 8080);
			router.push("httpServer", server);
			mw.next();
		},
		"pull -method=GET live": function(req, res) {
			res.end("YEEEEEEEEESSSS");
		}
	})
}