## Stripe payment module for your SaaS!

## Features

- Completely manages credits & stripe payments.
- Built-in reward system for users:
	- give rewards for referrals (credits)
	- give rewards for early adopters

### Requirements

- [plugin.js](https://github.com/crcn/plugin.js) - plugin system for node
- [backbone.js](http://backbonejs.org/) - used for the front-end
- [underscore.js](http://underscorejs.org/) - needed for backbone

### Usage:

bootstrap.js

```javascript

var plugin = require("plugin");

plugin().
params({
	starch: {
		plans: {
			"basic": {
				maxAccounts: 1
			},
			"pro": {
				maxAccounts: 4
			},
			"business": {
				maxAccounts: 4
			}
		}
	},
	http: {
		port: 80
	},
	mongodb: "mongodb://host/database"
}).
require("starch").
require(__dirname + "/starchModule.js").
load();
```


starchModule.js

```javascript
exports.require = ["starch", "plugin-express"];
exports.plugin = function(starch, httpServer) {
	

	//listening for charges events from stripe
	starch.events.on("charge.succeeded", function(data) {

	});



	httpServer.get("/premium/service", starch.middelware.paid("basic"), function(req, res) {
		//do stuff for basic plan
	});
}
```

