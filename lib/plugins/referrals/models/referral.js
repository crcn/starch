var step = require("step");

exports.require = ["plugin-mongodb", "auth", "customer"];
exports.plugin = function(con, auth, Customer) {
	var Schema = con.base.Schema,
	ObjectId = Schema.Types.ObjectId;


	var ReferralSchema = new Schema({

		/**
		 */

		"createdAt": { type: Date, default: Date.now },

		/**
		 */

		"key": String,

		/**
		 */

		"invitedBy": ObjectId,

		/**
		 * account this associated with
		 */

		"accounts": [ObjectId]
	});	

	auth.Account.on("validated", function(account) {

		var Referral = this.model("referrals");


		step(
			function() {
				Referral.findOne({ accounts: account._id }, this);
			},
			function(err, referral) {
				if(!referral) return console.warn("referral does not exist - can't update valudated");
				Referral.emit("validated", referral, account);
			}
		);
	});

	ReferralSchema.methods.addAccount = function(account, next) {
		try {
		this.accounts = this.accounts.concat(account._id);
		this.save(next || function(){});
		this.model("referrals").emit("signup", this, account);
	}catch(e) {
		console.error(e)
	}
	}


	Customer.on("paid", function(customer) {

		var Referral = this.model("referrals");

		step(
			function() {
				customer.getAccount(this);
			},
			function(account) {
				if(!account) return console.warn("account doesn't exist! - can't give referral points");

				this.account = account;
				Referral.findOne({ accounts: account._id }, this);
			},	
			function(err, referral) {
				if(!referral) return console.warn("referral does not exist - can't emit paid");

				Referral.emit("paid", referral, this.account);
			}
		);
	});


	return con.model("referrals", ReferralSchema);
}