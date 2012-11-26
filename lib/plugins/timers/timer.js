var structr = require("structr"),
EventEmitter = require("events").EventEmitter,
cron = require("cron"),
_ = require("underscore");

module.exports = structr(EventEmitter, {

	/**
	 */

	"__construct": function(tab) {
		this.crontab = tab; 
		this.tick();
	},


	/**
	 */

	"tick": function() {
		if(this._running) return;
		this._running = true;
		var self = this;
		setTimeout(function() {
			self.emit("run");
			self._running = false;
			self.tick();
		}, this.crontab);
	}
});