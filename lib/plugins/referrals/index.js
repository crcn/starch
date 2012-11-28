exports.require = ["./routes", "./models/referral"];
exports.plugin = function(routes, Referral) {
	return Referral;
}