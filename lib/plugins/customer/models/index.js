var step = require("step"),
_ = require("underscore");


exports.require = ["plugin-mongodb", "auth", "stripe.init", "plans"];
exports.plugin = function(mongodb, auth, stripe, plans, loader) {

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
		 * though plan is ultimately fetched from stripe, this is absolutely necessary
		 * to make sure creditBalance is charged the right amount
		 */

		"plan": String,

		/**
		 * the amount of credits a user has on their account. Think of this as funny money.
		 */

		"creditBalance": { type: Number, default: loader.params("starch.freeCredits") || 0 },

		/**
		 */

		"createdAt": { type: Date, default: Date.now },

		/**
		 */

		"lastBilledAt": Date

	});


	CustomerSchema.methods.incCredits = function(amount, next) {
		this.credits += amount;
		var self = this;
		step(
			function() {
				self.save(this);
			},
			function() {
				self.updateCreditBalance(this)
			},
			next || function(){}
		);
	}

	CustomerSchema.methods.removeCredit = function(next) {
		this.incCredits(-1, next);
	}

	CustomerSchema.methods.removeCredits = function(count, next) {
		this.incCredits(-count, next);
	}

	CustomerSchema.methods.getPlan = function(next) {
		plans.getPlan(this.plan, next);
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
				console.log("fetching account");
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
				console.log("finding customer");

				Customer.findOne({ owner: account._id }, this);
			}),

			/**
			 * update the stripe info
			 */

			on.success(function(customer) {


				if(this.customer = customer) {
					console.log("customer exists, updating info");
					customer.update(options, this);
				} else {
					console.log("creating new customer");
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
				console.log("saving customer");
				if(!this.customer) {
					this(null, this.customer);
				} else {
					var customer = new Customer({ _id: result.id, owner: this.account });
					this.account.ownItem(customer);
					customer.save(this);
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

		var on = outcome.error(function(e) {
			if(e) console.error(e);
			next();
		}), self = this;

		step(
			function() {
				stripe.customers.retrieve(self._id, this);
			},
			on.success(function(customer) {
				// plans.getPlan(customer.)
				if(customer.subscription.plan) {
					plans.findPlan(customer.subscription.plan.id, this);
				} else {
					this();
				}
			}),
			on.success(function(oldPlan) {
				this.oldPlan = oldPlan;
				if(options.plan) {
					plans.findPlan(options.plan, this);
				} else 
				if(oldPlan) {
					this(null, oldPlan)
				} else {
					this(new Error("unable to update customer without a new, or existing plan"));
				}
			}),
			on.success(function(newPlan) {
				this.newPlan = newPlan;
				this();
			}),
			on.success(function() {
				options.plan = this.newPlan.id;
				console.log("updating subscription")
				options.prorate = false;
				stripe.customers.update_subscription(self._id, _.pick(options, "prorate", "plan"), this);

			}),
			on.success(function() {


				//nothing's free. If the user uses the service, and the credits don't match, then subtract from the amount for the stripe account
				//for example:
				//basic:  c300 @ $10 ~ 3.3333 
				//pro: c700 @ $20 ~2.85 20% off
				//business: c1800 @$40 ~ 2.2 40% off

				//0 used credits
				//basic -> pro: 700 - (300 - 300) = 700 credits

				//100 used credits:
				//basic -> pro: 700 - (300 - 200) = 600 credits

				//600 used credits:
				//pro -> basic: 300 - (700 - 100) = -300 minutes ($3.33 to be charged)

				var usedCredits = (this.oldPlan.credits - self.creditBalance),
				newCreditBalance = this.newPlan.credits - usedCredits;

				console.log(this.oldPlan.credits, self.creditBalance, usedCredits, this.newPlan.credits, newCreditBalance)

				//account balance must never be below zero - that's handled by this app.
				//this is manually prorating the app 
				options.account_balance = getAccountBalance(this.newPlan, newCreditBalance);

				console.log("new account balance: %d", options.account_balance);
				console.log("user will be charged $%d extra at the end of the month.", options.account_balance/100);

				stripe.customers.update(self._id, _.pick(options, "account_balance", "card"), this);

				self.creditBalance = newCreditBalance;
				self.plan = this.newPlan.id;
			}),
			on.success(function() {
				console.log("updated customer");

				//save the credit balance
				self.save(this);
			}),
			next
		);
	}

	function getAccountBalance(plan, creditBalance) {
		return Math.max(0, -Math.floor(creditBalance * plan.creditToAmountRatio));
	}

	CustomerSchema.methods.updateCreditBalance = function(next) {
		var self = this, on = outcome.error(next);
		step(
			function() {
				plans.findPlan(self.plan, this);
			},
			on.success(function(plan) {
				stripe.customers.update(self._id, {
					"account_balance": getAccountBalance(plan, self.creditBalance)
				});
			})
		)
	}

	/*CustomerSchema.methods.getPlan = function() {
		step(
			function() {

			}
		)
	}*/

	CustomerSchema.methods.getSubscription = function(next) {
		// this.stripe.customers.

		//TODO
	}

	CustomerSchema.methods.hasCredits = function(next) {
		return callback(null, this.credits.length > 0);
	}

	Account.prototype.getCustomer = function(next) {
		var Customer = this.model("customers"),
		self = this;
		Customer.findOne({owner:this._id}, next);
	}



	//make the customer "ownable" so MULITPLE accounts can take
	//advantage of the paid features
	auth.ownable(CustomerSchema);

	return {
		Customer: mongodb.model("customers", CustomerSchema)
	};
}