var EventEmitter = require("events").EventEmitter,
_ = require("underscore"),
removeEmailHash = require("../utils/removeEmailHash");

exports.require = ["auth"];

exports.plugin = function(auth, loader) {

	var signupPoints = loader.params("starch.rewards.signup.credits") || 0,
	earlyBird = loader.params("starch.rewards.earlyBird") || []
	em = new EventEmitter();

	function emitReward(account, description, points) {
		em.emit("reward", {
			account: account._id, 
			key: removeEmailHash(account.email), 
			description: description,
			points: points,
			completed: true
		});
	}

	auth.Account.on("signup", function(account) {

		console.log("giving reward for signing up");


		auth.Account.count(function(err, n) {

			console.log(n)

			var pt = _.find(earlyBird, function(pt) {
				return pt.threshold > n;
			}),
			points = pt ? pt.credits : signupPoints,
			description = pt ? pt.description : "Signup";
				
			emitReward(account, description, points);
		});
	});


	return _.extend(em, {
		type: "signup",
		points: 0,
		max: 1
	});
}