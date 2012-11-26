var mongoose = require("mongoose"),
Schema = mongoose.Schema,
crypto = require("crypto"),
step = require("step"),
outcome = require("outcome");

/**
 */

var schema = module.exports = new Schema({

	/**
	 */

	email: { type: String, required: true, index: { unique: true }},

	/**
	 */

	username: { type: String, required: true, index: { unique: true }},

	/**
	 */

	password: { type: String, required: true, set: hashPass },

	/**
	 */

	createdAt: { type: Date, default: Date.now }
});

/**
 * returns the login token for the given profile
 */

schema.methods.getToken = function(onGetToken) {

	var TokenModel = this.model("token"),
	on = outcome.error(onGetToken),
	self = this;

	step(

		/**
		 * first check if the token exists
		 */

		function() {
			TokenModel.findOne({ profile: self._id, main: true }, this);
		},

		/**
		 * next create, or return the given token
		 */

		on.success(function(token) {

			var next = this;

			if(!token) {

				//make a new token with a scope that allows the user to do anything
				token = new TokenModel({
					main: true,
					profile: self._id,
					scopes: [{
						profile: self._id,
						permissions: ["*:*:*"] //grant ALL permissions to THIS profile
					}]
				});

				return token.save(function() {
					next(null, token);
				});
			}

			next(null, token);
		}),

		/**
		 */

		onGetToken
	);
}


/**
 * creates a token to be given away with only specific permissions.
 */

schema.methods.createToken = function(permissions, onCreateToken) {

	var TokenModel = this.model("token"),
	on = outcome.error(onCreateToken),
	token,
	self = this,
	Sandbox = require("../sandbox");

	step(

		/**
		 */

		function() {
			token = new TokenModel({
				profile: self._id,
				scopes: [{
					profile: self._id,
					permissions: Sandbox.fixPermissions(permissions)
				}]
			});
			token.save(this);
		},

		/**
		 */

		on.success(function() {
			this(null, token);
		}),

		/**
		 */

		onCreateToken
	);
}

/**
 * grant permission with the given scope
 */

schema.methods.grantPermission = function(user, permissions, onGrantPermissions) {

	var self = this, 
	on = outcome.error(onGrantPermissions),
	Sandbox = require("../sandbox"),
	fixedPermissions = Sandbox.fixPermissions(permissions),
	profile,
	token;

	if(!this.constructor.auth.sharedCollections.contains(fixedPermissions)) {
		return onGrantPermissions(new Error("cannot share a collection which isn't registered"));
	}

	step(

		/**
		 */

		function() {
			self.constructor.findOne({ _id: user._id }, this);
		},

		/**
		 */

		on.success(function(u) {
			profile = u;
			u.getToken(this);
		}),

		/**
		 */

		on.success(function(t) {
			token = t;

			token.scopes.push({
				profile: self._id,
				permissions: fixedPermissions
			});


			token.save(this);
		}),

		/**
		 */

		on.success(function() {
			self.constructor.emit("addPermissions", { token: token, permissions: fixedPermissions, profile: self });
			this(null, profile, token)
		}),

		/**
		 */

		onGrantPermissions
	);
}

/**
 * hashes the password so it's not stored plainly in the DB (security)
 */

function hashPass(pass) {
	return crypto.createHash("sha1").update(pass).digest("hex");
}

schema.hashPass = hashPass;