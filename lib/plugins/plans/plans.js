var structr = require("structr"),
sift = require("sift"),
outcome = require("outcome");

module.exports = structr({

	/**
	 */

	"__construct": function(stripe, options) {
		this._stripe = stripe;
		this._options = options;
		this.sync();
	},

	/**
	 */

	"step sync": function(next) {
		var self = this;
		this._stripe.plans.list(50, {}, outcome.error(next).success(function(resp) {
			self._plans = resp.data.map(function(plan) {
				return new Plan(plan, self._options[plan.id] || {});
			});
			next();
		}));
	},

	/**
	 */

	"step findPlan": function(payment, callback) {
		var plan = sift({ id: payment.plan }, this._plans).pop();
		if(!plan) return callback(new Error("plan doesn't exist"));
		callback(null, plan);
	},

	/**
	 */

	"step getPlans": function(next) {
		next(null, this._plans);
	}
});

var Plan = structr({

	/**
	 */

	"__construct": function(stripeInfo, starchInfo) {
		this.id = stripeInfo.id;
		this.amount = stripeInfo.amount;
		this.interval = stripeInfo.interval;
		this.maxAccounts = starchInfo.maxAccounts || -1;
	},

	/**
	 */

	"canAddAccount": function(payment) {
		return (this.maxAccounts < 0) || (payment.accounts.length < this.maxAccounts);
	}
});