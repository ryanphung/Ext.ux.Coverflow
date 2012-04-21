Ext.define('Ext.ux.coverflow.Image', {
	extend: 'Ext.Container',
	alias: 'widget.coverflow-image',
	autoEl: {
		tag: 'img',
		src: Ext.BLANK_IMAGE_URL
	},
	cls: 'coverflow-image',
	
	initComponent: function() {
		this.callParent(arguments);
		this.imageId = this.initialConfig.imageId;
	},
	
	// add custom processing to the onRender phase
	onRender: function() {
		this.autoEl = Ext.apply({}, this.initialConfig, this.autoEl);
		
		this.callParent(arguments);
	},
	
	setSrc: function(src) {
		if (this.rendered) {
			this.el.dom.src = src;
		} else {
			this.src = src;
		}
	},
	
	getSrc: function(src) {
		return this.el.dom.src || this.src;
	}
});