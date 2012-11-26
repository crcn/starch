var structr = require("structr"),
step        = require("step"),
outcome     = require("outcome"),
cronworker  = require("cronworker"),
_           = require("underscore");


var PermissionsWorker = structr({

	/**
	 */

	"__construct": function(options) {

		//the mongodb collection object
		this._collection = options.collection;

		//the connection to the database
		this._connection = options.connection;

		//the worker for performing tasks
		this._cronworker = cronworker.connect({
			type: "mongo",
			connection: options.collection
		}).queue("permissionsQueue");
	},


	/**
	 * starts the timer
	 */

	"start": function() {
		var self = this;
		this._cronworker.onJob(function(job, onComplete) {
			self._grantPermissions(job, onComplete);
		});
		return this;
	},

	/**
	 */

	"_grantPermissions": function(job, onComplete) {

		var on = outcome.error(onComplete);

		var self    = this, 
		data        = job.data,
		collection  = self._connection.collection(data.collection),
		// item        = data.item, //the specific item permissions are granted to
		search      = data.search || {}, //any query against items
		permissions = data.permissions, //the permission level, see http://en.wikipedia.org/wiki/Filesystem_permissions
		method      = data.method, //add, remove
		granter     = data.granter, //owner
		grantee     = data.grantee; //person permissions are given to


		step(

			/**
			 */

			function() {

				var query = { "sharing.profile": granter, "sharing.permissions": 7 },
				update = _.extend({}, search);

				//remove the permissions for the profile before adding them so there's no dupes
				update.$pull = { "sharing": { "profile": grantee } };

				if(method === "add") {
					update.$addToSet = { "sharing": { "profile": grantee, "permissions": permissions } };
				} 

				//update
				collection.update(query, update, { multi: true }, this);
			},

			/**
			 */

			on.success(function() {

				var result = {};

				if(item) {
					result.sendAt = Date.now() + 1000 * 60 * 60 * 24 * 365;
				}
			}),

			/**
			 */

			onComplete
		);
	}

});


function findOwners(item) {
	return item.sharing.filter(function(sharing) {
		return sharing.permissions === 7;
	});
}


var ModelMiddleware = structr({

	/**
	 */

	"__construct": function(options) {
		this._timer      = options.timer;
		this._collection = options.collection;
		this._connection = options.connection;
		this.init();
	},

	/**
	 */

	"init": function() {
		var self = this;
		this._connection.model(this._collection).schema.pre("save", function(next) {	
			self._timer.sendNow({ "data.collection": self._collection, "data.granter": {$in: findOwners(this) } });
		});
	}

});



module.exports = structr({


	/**
	 */

	"__construct": function(options) {

		this._timer = new PermissionsWorker({
			collection: this
			connection: options.connection
		}).start();
	},

	/**
	 */

	"register": function() {

	}
});


