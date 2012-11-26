var structr = require("structr");


var CollectionHook = structr({

	/**
	 */

	"__construct": function(collections, name) {
		var con = collections._auth.connection;
		this._connection = con.connection;
		this.model = con.model("friends");
		this.schema = this.model.schema;
		this.init();
	},

	/**
	 */

	"init": function() {
	}
});


module.exports = structr({
		
	/**
	 */

	"__construct": function(auth) {
		this._hooks = {};
		this._auth = auth;
		var self = this;

		// console.log(auth.ProfileModel.schema.pre)

		auth.ProfileModel.on("addPermissions", function(data) {
			self._addPermissions(data);
		});
	},

	/**
	 */

	"add": function(name, value) {
		return this._hooks[name] = new CollectionHook(this, name || value);
	},

	/**
	 */

	"contains": function(permission) {
		return !!this._hooks[permission.collection] || (permission.collection === "*");
	},

	/**
	 */

	"_addPermissions": function(data) {
		console.log(data);
	}


});