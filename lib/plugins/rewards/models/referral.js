var step = require("step"),
on = require("outcome"),
_ = require("underscore");

exports.require = ["plugin-mongodb", "auth", "customer", "stripe.events"];
exports.plugin = function(mongodb, auth, Customer, stripeEvents, loader) {

	var Schema = mongodb.base.Schema,
	ObjectId = Schema.Types.ObjectId,
	Account = auth.Account;


	/**
	 */


	var ReferalSchema = new Schema({

		/**
		 */

		account: ObjectId,

		/**
		 */

		signup: [ObjectId],

		/**
		 */

		paid: [ObjectId]

	});



	Account.on("validated", function(account) {

		if(!account.referredBy) return;

		console.log("updating account referrals");

		var Referral = this.model("referrals"),
		referredBy = account.referredBy,
		on = outcome.error(function(err) {
			console.error(err)
		});
		// Referal.findOne({ account}

		step(
			function() {
				Referral.findOne({ account: referredBy }, this);
			},
			on.success(function(referral) {

				if(!referral) {
					referral = new Referral({ account: referredBy });
				}
				Referral.emit("newSignupReferral", referral);

				if(_.find(referral.signup, function(acc) {
					return String(acc) == String(account._id);
				})) return referral.save(this);

				console.log("adding %s as referred by %s", account._id, referredBy);
				referral.signup.push(account._id);

				referral.save(this);

				Referral.emit("newSignupReferral", referral);
			}),
			on.success(function() {
			})
		);
	});


	stripeEvents.on("charge.succeeded", function(data) {
		var on = outcome.error(function(err) {
			console.error(err);
		});

		step(
			function() {
				Customer.findOne({ _id: data.customer }, this);
			},
			on.success(function(customer) {
				if(!customer) return on(new Error("customer doesn't exist - can't check referrals"));

				// customer.getAccount(this);
				Referral.findOne({ signup: this._paidAccountId = customer.owner }, this);
			}),
			on.success(function(referral) {
				if(!referral) {
					console.log("user signed up without referral");
					return;
				}

				var paidAccountId = this._paidAccountId;

				if(_.find(referral.paid, function(acc) {
					return String(acc) == String(paidAccountId);
				})) return referral.save(this);

				referral.paid.push(paidAccountId);
				referral.save(this);

				Referral.emit("newPaidReferral", referral);
			}),
			function() {

			}
		);
	});



	return mongodb.model("referrals", ReferalSchema);
}