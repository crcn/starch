var step = require("step");


exports.require = ["./models", "stripe.events", "stripe.init", "auth"];
exports.plugin = function(models, stripeEvents, stripe, auth) {

	var Customer = models.Customer,
	Account      = auth.Account;



	return Customer;
}