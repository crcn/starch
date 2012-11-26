var mongoose = require("mongoose"),
Schema       = mongoose.Schema,
validator    = require("validator"),
check        = validator.check;



var ReferalSchema = new Schema({

	/**
	 * full name of person
	 */

	referedTo: { type: String, required: true },

	/**
	 * email address
	 */

	email: { type: String, required: true, lowercase: true, trim: true, index: { unique: true } },


	/**
	 * stripe customer id
	 */

	customerId: String
});

/*UserSchema.path("email").validate(function(value) {
	return check(value).len(6, 64).isEmail();
}, "Invalid Email");

UserSchema.path("fullName").validate(function(value) {
	return check(value).len(1);
}, "Invalid Full Name");

UserSchema.path("customerId").validate(function(value) {

})*/


module.exports = mongoose.model("accounts", UserSchema);