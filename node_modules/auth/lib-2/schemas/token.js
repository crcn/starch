var mongoose = require("mongoose"),
Schema = mongoose.Schema,
ObjectId = Schema.Types.ObjectId,
crypto = require("crypto"),
Profile = require("./profile");


/**
 * tokens are like keys to ONE particular account. 
 */

var Scope = new Schema({

	/**
	 */

	profile: ObjectId,

	/**
	 */

	permissions: Array
});

var schema = module.exports = new Schema({


	/**
	 * is this the MAIN token?
	 */

	main: { type: Boolean, default: false },

	/**
	 * owner of the token
	 */

	profile: ObjectId,

	/**
	 * the public key used to access this token - this can be
	 * refreshed.
	 */

	key: { type: String, default: generateKey, index: { unique: true }},

	/**
	 */

	createdAt: { type: Date, default: Date.now },

	/**
	 * when does the token expire?
	 */

	expiresAt: Date,

	/**
	 * permissions granted to the given token
	 */

	scopes: [ Scope ],

	/**
	 * time in seconds to keep token alive for. -1 = forever
	 */

	ttl: { type: Number, default: 1000 * 60 * 60 * 24 * 6 }
});

/**
 */

module.exports.Scope = Scope;

/**
 */

schema.methods.regenerateKey = function(onGenerate) {
	this.key = generateKey();
	this.save(onGenerate);
}


/**
 */

schema.statics.getMainToken = function(account, callback) {

}

/**
 */

schema.statics.createToken = function(account, callback) {

}

/**
 * make sure the grantee is set
 */

schema.pre("save", function(next) {
	if(this.scopes) {
		for(var i = this.scopes.length; i--;) {
			this.scopes[i].permissions = String(this.scopes[i].permissions).toLowerCase();
		}
	}
	next();
});

/**
 * if a profile is removed, then remove the tokens with it
 */

Profile.pre("remove", function(next) {
	this.model("token").remove({ profile: this._id }, next);
	//TODO - remove scopes
});

/**
 *
 */

function generateKey() {
	return Date.now() + "_" + Math.round(Math.random() * 999999999999999);
}



