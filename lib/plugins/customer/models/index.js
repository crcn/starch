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

	CustomerSchema.statics.setCreditCard = function(options, callback) {
		var on = outcome.error(callback),
		Customer = this;

		console.log("updating customer info");

		step(

			/**
			 * first find the account
			 */

			function() {
				if(options.account) {
					this(null, options.account);
				} else
				if(options.email) {
					Account.findOne({ email: options.email }, this);
				}
			},

			/**
			 * next find the customer of the account if it exists
			 */

			on.success(function(account) {

				//no account? register one!
				if(!account) {
					account = new Account({ email: data.object.email, password: crc32(String(Math.random())) });

					//emit the new account so it can be handled. E.g: sending out invite to given person asking to signup ~ generating a password
					stripeEvents.emit("account.created", account); 
					account.save();

					console.warn("account with email %s doesn't exist! creating.", account.email);
				}

				this.account = account;

				Customer.findOne({ owner: account._id }, this);
			}),

			/**
			 * update the stripe info
			 */

			on.success(function(customer) {


				if(this.customer = customer) {
					customer.update(options, this);
				} else {
					this.createCustomer = true;
					stripe.customers.create({
						email: this.account.email,
						card: options.card,
						coupon: options.coupon,
						description: options.description,
						plan: options.plan,
						account_balance: options.accountBalance,
						trial_end: options.trialEnd,
						quantity: options.quantity
					}, this);
				}
			}),

			/**
			 * create the customer
			 */

			on.success(function(result) {
				if(this.createCustomer) {
					var customer = new Customer({ _id: result.id, owner: this.account });
					this.account.ownItem(customer);
					customer.save(this);
				} else {
					this(null, this.customer);
				}
			}),

			/**
			 */

			callback
		);
	}

	CustomerSchema.methods.cancel = function(next) {
		var on = outcome.error(next), self = this;
		step(
			function() {
				stripe.customers.cancel_subscription(self._id, false, this);
			},
			next
		);
	}

	CustomerSchema.methods.update = function(options, next) {

		var on = outcome.error(next), self = this;

		step(
			function() {
				if(options.plan) {
					stripe.customers.update_subscription(self._id, {
						plan: options.plan,
						// coupon: options.coupon,
						prorate: options.prorate,
						trial_end: options.trial_end
						// card: options.card
					}, this);
				} 
			},
			on.success(function() {
				if(options.card) {
					stripe.customers.update(self._id, {
						coupon: options.coupon,
						account_balance: options.accountBalance,
						card: options.card
					}, this);
				} else {
					this();
				}
			}),
			on.success(function() {
				on(null, self);
			})
		);	
	}

	CustomerSchema.methods.fetchSubscription = function(options, next) {

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