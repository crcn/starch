require("structr").mixin(require("structr-step"));

exports.require = [["./plugins"]];
exports.plugin = function(plugins, loader) {



	return {

		/**
		 */

		middleware: loader.loadModuleSync("http.middleware"),

		/**
		 */

		Customer: loader.loadModuleSync("customer"),

		/**
		 */

		rewards: loader.loadModuleSync("rewards"),

		/**
		 * inbound events from stripe
		 */

		events: loader.loadModuleSync("stripe.events"),

		/**
		 */

		timers: loader.loadModuleSync("timers")

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