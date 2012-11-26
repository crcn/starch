/**
 * collection permissions that are thrown into the cron job
 */

var mongoose = require("mongoose"),
Schema = mongoose.Schema,
ObjectId = Schema.Types.ObjectId;


 var Access = new Schema({

 	/**
 	 */

 	granter: ObjectId,


 	/**
 	 */

 	grantee: ObjectId,

 	/**
 	 */

 	collection: String,


 	/**
 	 * the particular item we're giving stuff to - NULL for all items
 	 */

 	item: String,

 	/**
 	 * TRUE if these permissions need to be regranted
 	 */

 	regrant: Boolean,


 	/**
 	 */

 	createdAt: 
 });