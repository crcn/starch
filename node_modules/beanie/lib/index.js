var beanpoll = require('beanpoll'),
    plugin     = require('plugin');



function _plugin(router) {
	
	router.on({

		//nothing to override? return
		'pull load': function(req, res) {
			res.end();
		}
	});
}


module.exports = function() {
	
	var router = beanpoll.router(),
	loader     = plugin(router);
	_plugin(router);

	loader.router = router;

	//once ALL the plugins are loaded in, call load on each route
	loader.once("ready", function() {
		router.request("load").success(function() {
			router.push("init");
		}).
		error(function(err) {
			console.error(err.stack);
		}).pull();
	});

	return loader;
}
