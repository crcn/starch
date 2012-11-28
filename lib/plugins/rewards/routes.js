var vine = require("vine");
exports.require = ["plugin-express", "auth", "./models"];

exports.plugin = function(httpServer, auth, models) {

	var Rewards = models.Reward;

	httpServer.get("/account/bonus", auth.middleware.authCheckpoint, function(req, res) {
		Reward.find({ account: req.account._id }, function(err, rewards) {
			if(err) return res.render("rewards", vine.error("unable to fetch rewards").data);
			res.render("rewards", vine.result(rewards).data);
		});
	});

	if(false)
	httpServer.get("/referral", auth.middleware.authCheckpoint, function(req, res) {
		/*Reward.find({ account: req.account._id }, function(err, rewards) {
			if(err) return res.render("rewards", vine.error("unable to fetch rewards").data);
			res.render("rewards", vine.result(rewards).data);
		});*/
	});
}