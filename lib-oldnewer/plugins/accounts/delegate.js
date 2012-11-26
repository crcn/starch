var structr = require("structr"),
step        = require('step'),
check       = require("validator").check,
verify      = require("../../utils").verify,
outcome     = require("outcome"),
logger      = require("winston").loggers.get("accounts");

require("./model");

module.exports = structr({

	/**
	 */

	"__construct": function(options) {
		this._stripe        = options.stripe;
		this._database      = options.database;
		this._referals      = options.referals;
		this.Account        = this._database.model("accounts");
	},

	/**
	 */


	"signup": function(options, callback) {
		
		var self = this,
		stripe   = self._stripe,
		Account = this.Account,
		account,
		on = outcome.error(callback);


		/*stripe.customers.create({
			email: options.email
		}, function(err, customer) {
			console.log(err);
			console.log(customer)
		})*/


		step(
			function() {
				verify.check(options).onError(callback).onSuccess(this).has("email", "fullName", "cardFullName", "stripeToken");
			},

			/**
			 * create the DB entry
			 */

			on.success(function() {
				logger.info("creating account");
				account = new Account({
					email: options.email,
					fullName: options.fullName
				});
				account.save(this);
			}),

			/**
			 * create the stripe customer
			 */

			on.success(function() {
				logger.info("creating stripe customer");
				stripe.customers.create({
					email: options.email
				}, this)
			}),

			/**
			 * update the account IF the stripe user was made successfuly
			 */

			function(err, customer) {


				//error? rollback.
				if(err) {
					return account.remove(function() {
						callback(err);
					});
				}

				account.customerId = customer.id;

				this();
			},

			/**
			 * now check if the user was refered
			 */

			/*on.success(function() {
				if(!options.referalCode) return callback();

				self.giveGoodies(options.referalCode, account, this);
			}),*/

			/**
			 */

			callback
		);
	},


	/**
	 */

	"giveGoodies": function(referalCode, from, callback) {

		var referals = this._referals,
		on = outcome.error(callback);

		step(

			/**
			 * refer the user, and 
			 */

			function() {
				referals.refered(referalCode, from._id, this);
			},

			/**
			 */

			on.success(function(modifier) {

				//not unlocked yet :(
				if(modifier) return callback();
			});
		);
	}

});