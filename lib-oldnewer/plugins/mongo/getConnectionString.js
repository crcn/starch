module.exports = function(options) {
	var c = ["mongodb://"];

	if(typeof options == "object") {
		if(options.user) {
			c.push(options.user);
			if(options.pass) {
				c.push(":", options.pass);
			}
			c.push("@");
		}
		c.push(options.host);
		if(options.port) {
			c.push(":", options.port);
		}
		c.push("/", options.database);
	} else {
		c = [options];
	}

	return c.join("");
}