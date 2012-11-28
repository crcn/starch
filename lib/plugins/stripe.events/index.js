var EventEmitter = require("events").EventEmitter,
step = require("step"),
outcome = require("outcome");


exports.require = ["stripe.init", "plugin-express"];

exports.plugin = function(stripe, httpServer) {

	var em = new EventEmitter();


	httpServer.post("/stripe/event", function(req, res) {
		res.end();

		var on = outcome.error(function(err) {
			console.warn(err);
		});
		console.log("EVENT");

		step(

			/**
			 * validate the event against stripe so random events cannot be injected
			 * TODO - cache used events - prevent sessionid injection-like attack
			 */

			function() {
				stripe.events.retrieve(req.body.id, this);
			},

			/**
			 * no errors? looks like the event exists. emit!
			 */

			on.success(function(event) {
				em.emit(event.type, event.data);
				em.emit("event", event);
			})
		);
		
	});

	
	return {
		on: function(command, cb) {
			em.on(command, cb);
		},
		emit: function(event, data) {
			em.emit(event, data);
		}
	};
}