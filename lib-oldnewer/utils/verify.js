var verify = require("verify")();

verify.register("fullName").len(2);
verify.register("cardFullName").is("fullName");
verify.register("stripeToken").len(2);

module.exports = verify;