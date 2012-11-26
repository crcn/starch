var step = require("step");

exports.require = ["plugin-mongodb", "auth", "stripe.init"];
exports.plugin = function(mongodb, auth, stripe, loader) {

	var Schema = mongodb.base.Schema,
	ObjectId = Schema.Types.ObjectId,
	Account = auth.Account;


	var CustomerSchema = new Schema({

		/**
		 * the stripe customer ID
		 */

		"_id": String,

		/**
		 */

		"owner": ObjectId,

		/**
		 * the associated 
		 */

		"plan": { type: String, default: "none" },

		/**
		 * the amount of credits a user has on their account. Think of this as funny money.
		 */

		"credits": { type: Number, default: loader.params("starch.freeCredits") || 0 },

		/**
		 */

		"createdAt": { type: Date, default: Date.now },

		/**
		 */

		"lastBilledAt": Date

	});


	CustomerSchema.methods.incCredits = function(amount, next) {
		this.credits += amount;
		this.save(next);
	}

	CustomerSchema.methods.removeCredit = function(next) {
		this.incCredits(-1, next);
	}

	CustomerSchema.methods.hasCredits = function(next) {
		return callback(null, this.credits.length > 0);
	}

	Account.prototype.getCustomer = function() {
		var Customer = this.models("customers"),
		self = this;
		Customer.findOne(this.addToSearch(), this)
	}



	//make the customer "ownable" so MULITPLE accounts can take
	//advantage of the paid features
	auth.ownable(CustomerSchema);

	return {
		Customer: mongodb.model("customers", CustomerSchema)
	};
}