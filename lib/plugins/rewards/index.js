var step = require("step"),
on = require("outcome");

exports.require = ["./models", "./routes", "customer", ["./triggers"]];
exports.plugin = function(models, routes, Customer, triggers, loader) {

	var Reward = models.Reward,
	signupReferralCredits = loader.params("starch.referrals.signup.credits"),
	paidReferralCredits = loader.params("starch.referrals.paid.credits"),
	maxSignupReferrals = loader.params("starch.referrals.signup.max") || -1,
	maxPaidReferrals = loader.params("starch.referrals.paid.max") || -1;

	var types = {};

	triggers.forEach(function(trigger) {
		types[trigger.type] = trigger;
		trigger.on("reward", function(raw) {
			raw.type = trigger.type;
			Reward.addOne(raw, function(err) {
				if(err) console.error(err);
			});
		});
		trigger.giveGoodies = increaseCredits;
	})

	Reward.types = types;


	function increaseCredits(reward) {

		var credits = reward.points,
		account = reward.account;

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

	return Reward;
}