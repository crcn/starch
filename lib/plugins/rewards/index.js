var step = require("step"),
on = require("outcome");

exports.require = ["./models", "./routes", "customer"];
exports.plugin = function(models, routes, Customer, loader) {
	var Referral = models.Referral,
	signupReferralCredits = loader.params("starch.referrals.signup.credits"),
	paidReferralCredits = loader.params("starch.referrals.paid.credits"),
	maxSignupReferrals = loader.params("starch.referrals.signup.max") || -1,
	maxPaidReferrals = loader.params("starch.referrals.paid.max") || -1;


	function increaseCredits(account, credits) {
		var on = outcome.error(function(e) {
			console.error(e);
		});

		console.log("adding +%d credits to  account %s", credits, account);

		step(
			function() {
				Customer.getCustomer({ owner: account }, this);
			},
			on.success(function(customer) {
				customer.creditBalance += credits;
				customer.save(this);
			}),
			on.success(function() {
			})
		);
	}

	if(signupReferralCredits)
	Referral.on("newSignupReferral", function(referral) {
		if(~maxSignupReferrals && referral.signup.length > maxSignupReferrals) return;

		increaseCredits(referral.account, signupReferralCredits);
	});

	if(paidReferralCredits)
	Referral.on("newPaidReferral", function(referral) {
		if(~maxPaidReferrals && referral.paid.length > maxPaidReferrals) return;
		
		increaseCredits(referral.account, signupReferralCredits);
	});

	return Referral;
}