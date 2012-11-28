var EventEmitter = require("events").EventEmitter,
_ = require("underscore"),
removeEmailHash = require("../utils/removeEmailHash"),
step = require("step");

exports.require = ["auth", "stripe.events", "customer"];

exports.plugin = function(auth, stripeEvents, Customer, loader) {

	var signupReferralCredits = loader.params("starch.referrals.paid.credits"),
	maxSignupReferrals = loader.params("starch.referrals.paid.max") || -1,
	em = new EventEmitter();


	stripeEvents.on("event", function(data) {
		console.log(data)
	});

	Customer.on("paid", function(customer) {

		var on = outcome.error(function(err) {
			console.error(err);
		});

		step(
			function() {
				customer.getAccount(this);
			},
			on.success(function(account) {
				if(!account) return on(new Error("account doesn't exist!"));
				if(!account.referredBy) return on(new Error("account not referred by anyone"));

				em.emit("reward", {
					account: account.referredBy, 
					key: removeEmailHash(account.email), 
					description: account.email,
					completed: true
				});
			})
		);
	});


	return _.extend(em, {
		type: "paid",
		points: signupReferralCredits,
		max: maxSignupReferrals
	});
}