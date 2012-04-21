Ext.define('Demo.view.Selection', {
	extend: 'Ext.Container',
	alias: 'widget.slideselection',
	padding: '10px',
	items: [{
		xtype: 'button',
		itemId: 'add',
		text: 'Add Image'
	}, {
		xtype: 'button',
		itemId: 'remove',
		text: 'Remove Image'
	}]
});