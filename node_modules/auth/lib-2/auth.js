var structr = require("structr"),
schemas = require("./schemas"),
_ = require("underscore"),
step = require("step"),
Sandbox = require("./sandbox"),
outcome = require("outcome"),
SharedCollections = require("./SharedCollections");

/**
 * database delegate
 */

module.exports = structr({

	/**
	 */

	"__construct": function(options) {
		this.connection        = options.connection;
		this.ProfileModel      = this.connection.model("profile", schemas.Profile);
		this.ProfileModel.auth = this;

		this.TokenModel        = this.connection.model("token", schemas.Token);
		this.ScopeModel        = this.connection.model("scope", schemas.Token.Scope);
		this.sharedCollections = new SharedCollections(this);
		this.defaultTokenTTL   = options.tokenTTL || -1; //never
	},

	/**
	 * sandboxed used to grant access for other accounts to share info
	 */

	"sandbox": function(requiredPermissions) {
		console.log(requiredPermissions)
		return new Sandbox(this, requiredPermissions);
	},

	/**
	 * signs the user up
	 */

	"signup": function(options, onSignup) {
		var user = new this.ProfileModel(options);
		user.save(outcome.error(onSignup).success(function() {
			onSignup(null, { user: user });
		}));
	},

	/**
	 * logs a user in
	 */

	"login": function(options, onLogin) {

		var on = outcome.error(onLogin),
		self = this;

		var onUser = on.success(function(user) {
			if(!user) return onLogin(self._invalidUserError());
			onLogin.apply(null, arguments);
		});

		if(options.username || options.email) {
			return this._loginWithUP(options, onLogin);
		} else
		if(options.token || options.key) {
			return this._loginWithToken(options, onLogin);
		} else {
			return callback(this._invalidUserError());
		}
	},

	/**
	 */

	"_invalidUserError": function() {
		return new Error("invalid authentication credentials");
	},

	/**
	 * logs in with user / pass
	 */

	"_loginWithUP": function(options, onLogin) {

		var q = { password: options.password }, 
		on = outcome.error(onLogin),
		self = this,
		user,
		token;

		if(options.username) {
			q.username = options.username;
		} else {
			q.email = options.email;
		}

		q.password = schemas.Profile.hashPass(q.password);


		step(

			/**
			 */

			function() {
				self.ProfileModel.findOne(q, this)
			},

			/**
			 */

			on.success(function(u) {
				user = u;
				if(!user) return onLogin(new Error(self._invalidUserError()));
				user.getToken(this)
			}),

			/**
			 */

			on.success(function(t) {
				token = t;
				token.ttl = options.ttl || self.defaultTokenTTL;
				token.expiresAt = ~token.ttl ? new Date(Date.now() + token.ttl) : null;
				token.save(this)
			}),

			/**
			 */

			on.success(function() {
				this(null, { user: user, token: token });
			}),

			/**
			 */

			onLogin
		);
	},

	/**
	 * logs in with token
	 */

	"_loginWithToken": function(options, onLogin) {

		var TokenModel = this.TokenModel,
		ProfileModel   = this.ProfileModel;

		var q = { key: options.token || options.key },
		on = outcome.error(onLogin),
		token;

		step(

			/**
			 */

			function() {
				TokenModel.findOne(q, this);
			},

			/**
			 */

			on.success(function(t) {
				if(!t) return onLogin(new Error("token does not exist"));
				if(t.expireAt && t.expireAt.getTime() > Date.now()) return onLogin(new Error("token has expired"));
				token = t;
				ProfileModel.find({ _id: token.granter }, this);
			}),

			/**
			 */

			on.success(function(user) {
				onLogin(null, { user: user, token: token });
			})

		);
	}
});