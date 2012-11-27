var plans = require("../plans");

module.exports = require("./base").extend({

	plans: plans,

	"template": require("./paymentForm.ejs"),

	"events": {
		"click button": "submitPayment"
	},

	"submitPayment": function(e) {
		
		this.$el.find("button").attr("disabled", "disabled");

		Stripe.createToken({
	        number: $('.card-number').val(),
	        cvc: $('.card-cvc').val(),
	        exp_month: $('.card-expiry-month').val(),
	        exp_year: $('.card-expiry-year').val()
	    }, _.bind(this.onStripeToken, this));

		e.preventDefault();
	},
	"onStripeToken": function(coe, result) {

		if(result.error) {
			this.error = result.error;
			return this.render();
		}

		var self = this;

		$.ajax({
			type: "POST",
			url: "/starch/payment.json",
			data: { 
				stripeToken: result["id"],
				plan: this.$el.find("[name='plan']").val()
			},
			success: function(result) {
				console.log("result")
				if(result.errors) {
					return;
				}

				if(self.onPaid) return self.onPaid();
			}
		});
	}

});