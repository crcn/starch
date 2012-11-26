_ = require("underscore");
require("./emberMonkeyPatch");
require("./registerTemplates");

exports.init = function() {
	global.Starch = Ember.Application.create({
		//"rootElement": "#someId"
	});

	_.extend(global.Starch, {
		StripeView: require("./views/stripe")
	});
}