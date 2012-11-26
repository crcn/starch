var structr = require("structr"),
step = require("step"),
outcome = require("outcome");

module.exports = structr({

	/**
	 */

	"__construct": function(auth, permissions) {
		this.auth  = auth;

		module.exports.explodePermissions(this._requiredPermissions = {}, permissions);
	},

	/**
	 * logs the user in validating against the sandbox
	 */

	"login": function(query, callback) {

		var on = outcome.error(callback),
		self = this,
		token;

		step(

			/**
			 */

			function() {
				self.auth.login(query, this);
			},

			/**
			 */

			on.success(function(data) {
				var access = data.access = self._getAccess(data.token);

				if(!access.profiles.length) return callback(new Error("not authorized"));

				this(null, data);
			}),

			/**
			 */

			callback
		);
	},

	/**
	 * checks if a given token has authorization
	 */

	"_getAccess": function(token) {

		var profiles    = [];
		var collections = {};

		for(var i = token.scopes.length; i--;) {

			var scope = token.scopes[i];

			for(var j = scope.permissions.length; j--;) {	

				var perm = module.exports.parsePermission(scope.permissions[j]);


				if(~this._requiredPermissions[module.exports.stringifyPermission(perm)]) {
					profiles.push(scope.profile);

					if(perm.collection != "*" && perm.item != "*") {
						if(!collections[perm.collection]) collections[perm.collection] = [];
						collections[perm.collection].push(perm.item);
					}
				}
			}
		}

		return {
			profiles: profiles,
			collections: collections
		};
	}
});


module.exports.explodePermissions = function(into, permissions) {

	if(permissions instanceof Array) {
		for(var i = permissions.length; i--;) {
			module.exports.explodePermissions(into, permissions[i]);
		}
		return;
	}


	var permission = module.exports.parsePermission(permissions);

	var ops = [
		[permission.method, "*", "*"], //GET, DELETE, PUT, PATCH
		[permission.method, permission.collection, "*"], //groups, users, friends
		[permission.method, permission.collection, permission.item] //specific item id
	];

	for(var j = ops.length; j--;) {
		into[module.exports.stringifyPermission(ops[j])] = 1;
	}
}

module.exports.fixPermissions = function(permissions) {
	return module.exports.parsePermissions(permissions).map(function(perm) {
		return module.exports.stringifyPermission(perm);
	})
};

module.exports.parsePermissions = function(rawPermissions) {

	var permissions = [];
	if(rawPermissions instanceof Array) {
		for(var i = rawPermissions.length; i--;) {
			permissions.push(module.exports.parsePermission(rawPermissions[i]));
		}
	} else {
		permissions.push(module.exports.parsePermission(rawPermissions));
	}

	return permissions;
}

module.exports.parsePermission = function(permission) {
	var method, collection, item;

	if(permission instanceof Array) {
		permission = permission.join(":");
	} 

	if(typeof permission == "string") {
		var permissionParts = permission.split(":");
		method              = permissionParts.shift();
		collection          = permissionParts.shift();
		item                = permissionParts.shift();
	} else {
		method     = permission.action;
		collection = permission.collection;
		item       = permission.item;
	}

	return {
		method    : method     || "*",
		collection: collection || "*",
		item      : item       || "*"
	};
}

module.exports.stringifyPermission = function(permission) {
	var perm = module.exports.parsePermission(permission);
	return [perm.method, perm.collection, perm.item].join(":").toLowerCase();
}