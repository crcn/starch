exports.require = ["plugin-mongodb"];
exports.plugin = function(mongodb) {

	var Schema = mongodb.base.Schema,
	ObjectId = Schema.Types.ObjectId;


	/**
	 */


	var ReferalSchema = new Schema({

		/**
		 */

		account: ObjectId,


		/**
		 * max number of customers for this to work
		 */

		max: { type: Number, default: -1 },

		/**
		 */

		customers: [ObjectId]
		
	});


	ReferalSchema.pre("save", function(next) {
		if(~this.max && this.customers.length > this.max) {
			return next(new Error("referal code has been maxed out"));
		}

		return next();
	})


	return {
		Referal: mongodb.model("referals", ReferalSchema)
	};
}