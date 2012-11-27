module.exports = Backbone.View.extend({
	"initialize": function() {
		this.render();
	},
	"prepareChildren": function() { },
	"render": function() {
		var tpl = this.template;
		if(tpl) $(this.el).html(tpl(this.templateData()));

		if(!this._preparedChildren) {
			this._preparedChildren = true;
			this._children = this.prepareChildren() || [];
		} else {
			for(var i = this._children.length; i--;) {
				this._children[i].render();
			}	
		}
	},
	"update": function(data) {
		_.extend(this.data(), data);
		this.render();
	},
	"templateData": function() {
		return this;
	},
	"data": function() {
		return this.options.data || this.options || this;
	},
	"dispose": function() {
		// this.remove(); //don't want to remvoe the element - it will be overwritten
		this.$el.find("*").unbind();
		for(var i = this._children.length; i--;) {
			this._children[i].dispose();
		}

		this._children = [];
	}
});