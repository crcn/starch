var step = require("step"),
outcome = require("outcome");

exports.require = ["plugin-mongodb"];
exports.plugin = function(mongodb) {

	var Schema = mongodb.base.Schema,
	ObjectId = Schema.Types.ObjectId;



	var RewardSchema = new Schema({

		/**
		 */

		"account": ObjectId,

		/**
		 * key to the reward so dupes don't get added
		 */

		"key": String,

		/**
		 * type of reward
		 */

		"type": String,

		/**
		 * points earned
		 */

		"points": { type: Number, default: 0 },

		/**
		 */

		"createdAt": { type: Date, default: Date.now },

		/**
		 * description of the reward
		 */

		"description": String
	});


	RewardSchema.statics.addOne = function(options, next) {
		var Reward = this.model("rewards"),
		on = outcome.error(next);


		if(!options.account) return next(new Error("account must be present"));
		if(!options.key) return next(new Error("key must be present"));
		if(!Reward.types[options.type]) return next(new Error("reward type does not exist"));

		var rewardTypeInfo = Reward.types[options.type];

		step(
			function() {
				Reward.findOne({ account: options.account, key: String(options.key), type: options.type }, this);
			},
			on.success(function(reward) {

				if(reward) return next(new Error("reward already unlocked"));


				this.reward = reward = new Reward(options);

				//count the rewards with the given type under the user so we don't give too many goodies
				Reward.count({ acocunt: options.account, type: options.type}, this);
			}),
			on.success(function(count) {
				if(~rewardTypeInfo.max && count > rewardTypeInfo.max) {
					console.log("reward '%s' has been maxed out for %s", options.type, options.account);
					return this.reward.save();
				}


				this.reward.points = rewardTypeInfo.points;
				rewardTypeInfo.giveGoodies(this.reward);
				this.reward.save();
			})
		);
	}


	return mongodb.model("rewards", RewardSchema);
}