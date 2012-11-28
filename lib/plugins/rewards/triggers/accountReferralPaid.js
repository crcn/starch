var EventEmitter = require("events").EventEmitter,
_ = require("underscore"),
removeEmailHash = require("../utils/removeEmailHash"),
step = require("step");

exports.require = ["auth", "stripe.events", "referrals"];

exports.plugin = function(auth, stripeEvents, Referral, loader) {

	var signupReferralCredits = loader.params("starch.referrals.paid.credits"),
	maxSignupReferrals = loader.params("starch.referrals.paid.max") || -1,
	em = new EventEmitter();


	stripeEvents.on("event", function(data) {
		console.log(data)
	});


	Referral.on("paid", function(referral, account) {

		em.emit("reward", {
			account: referral.invitedBy, 
			key: removeEmailHash(account.email), 
			description: account.email,
			completed: true
		});

	});


	return _.extend(em, {
		type: "referral_paid",
		points: signupReferralCredits,
		max: maxSignupReferrals
	});
}