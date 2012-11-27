require("structr").mixin(require("structr-step"));

exports.require = [["./plugins"]];
exports.plugin = function(plugins, loader) {


	loader.module("stripe.events").on("event", function(acc) {
		// console.log(acc)
	});



	return {

		/**
		 */

		middleware: loader.module("http.middleware"),

		/**
		 */

		Customer: loader.module("customer"),

		/**
		 */

		rewards: loader.module("rewards"),

		/**
		 * inbound events from stripe
		 */

		events: loader.module("stripe.events"),

		/**
		 */

		timers: loader.module("timers")

	};
}



/*


{
	plans: {
		plus: {
			credits: 1000
		}
	}
}

*/