var structr = require("structr");

module.exports = structr({

	/**
	 */


	"__construct": function(core) {
		this._core  = core;
		this._db    = core.database;
		this._model = this._db.model("users");
	},

	/**
	 */

	"signup": function(options, callback) {
		//TODO
	}
});