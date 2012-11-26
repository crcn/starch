Ember.TextField.reopen({
    attributeBindings: ['accept', 'autocomplete', 'autofocus', 'name', 'required']
});


Ember.Select.reopen({
	fetch: null,
	init: function() {
		this._super();
		var fetch = this.get("fetch"), self = this;
		if(fetch) {
			fetch(function(err, content) {
				if(err) return console.err(err);
				self.set("content", content);
			})
		}
	}
})