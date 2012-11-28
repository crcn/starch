var EventEmitter = require("events").EventEmitter,
_ = require("underscore"),
removeEmailHash = require("../utils/removeEmailHash");

exports.require = ["auth"];

exports.plugin = function(auth, loader) {

	var signupReferralCredits = loader.params("starch.referrals.signup.credits"),
	maxSignupReferrals = loader.params("starch.referrals.signup.max") || -1,
	em = new EventEmitter();


	auth.Account.on("validated", function(account) {


		var referredBy = account.referredBy,
		on = outcome.error(function(err) {
			console.error(err)
		});
		
		em.emit("reward", {
			account: referredBy, 
			key: removeEmailHash(account.email), 
			description: account.email
		});
	});


	return _.extend(em, {
		type: "signup",
		points: signupReferralCredits,
		max: maxSignupReferrals
	});
}