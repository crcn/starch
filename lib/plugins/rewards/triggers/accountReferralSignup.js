var EventEmitter = require("events").EventEmitter,
_ = require("underscore"),
removeEmailHash = require("../utils/removeEmailHash");

exports.require = ["auth"];

exports.plugin = function(auth, loader) {

	var signupReferralCredits = loader.params("starch.referrals.signup.credits"),
	maxSignupReferrals = loader.params("starch.referrals.signup.max") || -1,
	em = new EventEmitter();

	function emitReward(status, completed, account) {
		var referredBy = account.referredBy;
		em.emit("reward", {
			account: referredBy, 
			key: removeEmailHash(account.email), 
			description: account.email,
			status: status,
			completed: completed
		});
	}

	auth.Account.on("signup", function(account) {
		console.log("account signup, updating reward");
		emitReward("Waiting for validation", false, account);
	});


	auth.Account.on("validated", function(account) {	
		console.log("account validated, updating reward");
		emitReward("completed", true, account);
	});


	return _.extend(em, {
		type: "referral_signup",
		points: signupReferralCredits,
		max: maxSignupReferrals
	});
}