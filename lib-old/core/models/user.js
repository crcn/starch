var mongoose = require("mongoose"),
Schema       = mongoose.Schema;

var UserSchema = new Schema({

	/**
	 * full name of person
	 */

	fullName: { type: String, required: true },

	/**
	 * email address
	 */

	email: { type: String, required: true, lowercase: true, trim: true, index: { unique: true } },

	/**
	 * stripe customer id
	 */

	customerId: String
});


mongoose.model("users", UserSchema);