var structr = require("structrr");

module.exports = structr({

	/**
	 */

	"__construct": function(options) {
		this.referals = options;
		this._database = options.database;
	},


	/**
	 * lists all the available referal perks 
	 */

	"listReferals": function(callback) {
		callback(null, this.referals);
	},


	/**
	 * called when a user has been referered. returns modifier for updating plan.
	 */

	"refered": function(referalCode, to, callback) {
		//
	},
})