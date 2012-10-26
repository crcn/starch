var express     = require("express"),
beanpoll        = require("beanpoll"),
beanpollConnect = require("../"); 


var router = beanpoll.router();

router.on({
	// "pull parseBody": express.bodyParser(),
	"pull auth": function(req, res) {
		console.log(req.query)
		if(req.query.user == "user" && req.query.pass == "pass") {
			this.next();
		} else {
			res.end("auth failed!");
			// res.error("fail");
		}
	},
	"pull -method=GET auth -> saveProfile": function(req, res) {
		res.end({ name: "success!" });
	}
});


var server = express();
server.use(beanpollConnect.middleware(router));

server.listen(8080); //access saveProfile from the web
