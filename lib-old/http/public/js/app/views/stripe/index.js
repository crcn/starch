var Plan = require("./models/plan");


module.exports = Ember.View.extend({

	/**
	 */

	templateName: "signup-form",

	/**
	 */

	action: "/payment",

	/**
	 */

	init: function() {
		this._super();

		//dumy context for debugging
		this.set("context", Ember.Object.create({
			"card-number": "4242424242424242",
			"card-cvc": "222",
			"card-expiry-month": "10",
			"card-expiry-year": "2014",
			"plans": Ember.ArrayController.create()
		}));

		//publisher key is needed to make payments (api key)
		var pk = this.get("publisherKey");
		if(!pk) throw new Error("stripe publisherKey must be present");

		Stripe.setPublishableKey(pk);

		this._fetchPlans();
	},

	/**
	 */

	submitPayment: function() {

		var paymentInfo = this._getFormData(this.get("context")), self = this;

		Stripe.createToken(paymentInfo, function(status, response) {
			if(response.error) {
				return alert(response.error.message);
			}

			self._submitToken(response);
		});
	},

	/**
	 */

	"_getFormData": function(ctx) {
		return {
			number: ctx.get("card-number"),
			cvc: ctx.get("card-cvc"),
			exp_month: ctx.get("card-expiry-month"),
			exp_year: ctx.get("card-expiry-year")
		};
	},

	/**
	 */

	_submitToken: function(token) {

		var $form = $($(this.get("element")).find("form"));
		$form.append("<input type='hidden' name='stripeToken' value='" + token.id + "' />");
		$form.submit();
	},

	/**
	 */

	"_fetchPlans": function() {
		if(!this.getPlans) return;
		var self = this, context = self.get("context");
		this.getPlans(function(err, plans) {
			if(err) return console.error(err);
			var mapped = plans.map(function(plan) {	
				return Plan.create(plan);
			});
			context.get("plans").set("content", mapped);
			context.set("plan", mapped[0]);
		})
	}


});