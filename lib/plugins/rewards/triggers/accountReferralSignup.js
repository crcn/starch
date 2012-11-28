var EventEmitter = require("events").EventEmitter,
_ = require("underscore"),
removeEmailHash = require("../utils/removeEmailHash");

exports.require = ["auth", "referrals"];

exports.plugin = function(auth, Referral, loader) {

	var signupReferralCredits = loader.params("starch.referrals.signup.credits"),
	maxSignupReferrals = loader.params("starch.referrals.signup.max") || -1,
	em = new EventEmitter();

	function emitReward(status, completed, referral, email) {

		em.emit("reward", {
			account: referral.invitedBy, 
			key: removeEmailHash(email), 
			description: email,
			status: status,
			completed: completed
		});
	}

	Referral.on("signup", function(referral, account) {
		console.log("account signup, updating reward");
		emitReward("Waiting for account validation", false, referral, account.email);
	});

	Referral.on("sent", function(referral, email) {
		console.log("account invite sent, updating reward");
		emitReward("Waiting for invitation", false, referral, email);
	});


	Referral.on("validated", function(referral, account) {	
		console.log("account validated, updating reward");
		emitReward("completed", true, referral, account.email);
	});


	return _.extend(em, {
		type: "referral_signup",
		points: signupReferralCredits,
		max: maxSignupReferrals
	});
}