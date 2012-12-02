var _ = require("underscore"),
vine = require("vine"),
comerr = require("comerr");

exports.require = ["auth", "customer"];
exports.plugin = function(auth, Customer) {

	return {
		premiumCheckpoint: function(query) {
			return [
				auth.middleware.authCheckpoint,
				function(req, res, next) {
					if(req.customer) return next();
					Customer.findOne(_.extend({ owner: req.account._id }, query), function(err, cust) {
						if(/\.json$/.test(req.path) && !cust) return res.send(vine.error(new comerr.PaymentRequired("No more credits")));
						req.customer = cust;
						if(!cust) return res.render("upgrade");
						next();
					});
				}
			];
		}
	}
}