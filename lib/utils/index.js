var EventEmitter = require("events").EventEmitter;

exports.bindRouter = function() {
	var router = arguments[0],
	data = {},
	keys = Array.prototype.slice.call(arguments, 1),
	em   = new EventEmitter();

	keys.forEach(function(key) {
		router.on("push " + key, function(value) {
			data[key] = value;

			for(var i = keys.length; i--;) {
				if(!data[keys[i]]) return;
			}

			em.emit("full", data);
		});

	});

	return {
		on: function() {
			em.on.apply(em, arguments);
		},
		once: function() {
			em.once.apply(em, arguments);
		},
		getData: function() {
			return data;
		}
	}
}




exports.verify = require("./verify");


/*exports.validate = function() {
	var options = arguments[0],
	keys = Array.prototype.slice.call(arguments, 1);

	keys.forEach(function(keyp) {
		var parts = keyp.split(":"),
		key       = parts[0],
		type      = parts[1] || key;
	});
}*/


/*

var validator = require("validator");
validator.register("email").match(/emailPattern/);
validator.register("test").is("email")
*/