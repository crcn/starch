var argv = require("optimist");


require("../").start({
	mongo: {
		host: "localhost",
		database: "starch-test"
	},
	http: {
		port: 8080
	}
})