require("structr").mixin(require("structr-step"));

exports.require = [["./plugins"]];
exports.plugin = function(plugins, loader) {


	loader.module("stripe.events").on("event", function(acc) {
		console.log(acc)
	});


	return {

		/**
		 */

		Customer: loader.module("customer"),

		/**
		 */

		referals: loader.module("referals"),

		/**
		 * inbound events from stripe
		 */

		events: loader.module("stripe.events")
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