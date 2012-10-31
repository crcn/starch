var Delegate = require("./delegate"),
sift         = require("sift"),
utils        = require("../../utils");

/**
 * referal system for giving features to people who sign up
 */


 exports.plugin = function(router, loader) {

 	utils.bindRouter(router, "database").once("full", function(data) {
 		data.referals = sift({ type: "referal" }, loader.params("stripe.promotions") || []);
 		router.push("referals", new Delegate(data));
 	});
 }