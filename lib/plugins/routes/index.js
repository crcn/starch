var step = require("step"),
vine = require("vine");

exports.require = ["plugin-express", "stripe.init", "customer", "plans", "auth"];
exports.plugin = function(httpServer, stripe, Customer, plans, auth) {


	/**
	 */

	httpServer.get("/starch/plans.json", function(req, res) {

		var on = outcome.error(function(err) {
			res.send(vine.error("unable to fetch plans").data);
		});

		plans.getPlans(on.success(function(plans) {
			res.send(vine.result(plans).data);
		}));
	});

	/**
	 */

	httpServer.get("/starch/customer/subscription.json", auth.middleware.authCheckpoint, function() {
		res.end("TODO!");
	});


	/**
	 */

	httpServer.post("/starch/payment.json", auth.middleware.authCheckpoint, function(req, res) {

		var email = req.body.email,
		ccToken   = req.body.creditCardToken;

		Customer.setCreditCard({ account: req.account, card: ccToken }, function() {
			console.log(arguments);
			res.end(true);
		});
	});


	/**
	 */

	httpServer.post("/starch/payment/cancel.json", auth.middleware.authCheckpoint, function(req, res) {

		var on = outcome.error(function(err) {
			res.end(vine.error("Unable to cancel subscription. Please contact customer support. ").data);
		});


		step(
			function() {
				req.account.getCustomer(this);
			},
			on.success(function(customer) {
				customer.cancel(this);
			}),
			on.success(function() {
				res.end(vine.message("successfuly canceled subscription").data);
			})
		);
	})
}