
var PaymentForm = require("./views/paymentForm");
exports.PaymentForm = PaymentForm;
exports.plans = require("./plans");
window.Starch = module.exports;

head.js("https://js.stripe.com/v1/", function() {
	Stripe.setPublishableKey(require("./stripeKey"));
});

