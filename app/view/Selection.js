/*
Selection view, to allow editing the store

Author: Ryan Phung
*/

Ext.define('Demo.view.Selection', {
	extend: 'Ext.Container',
	alias: 'widget.slideselection',
	padding: '10px',
	items: [{
		xtype: 'button',
		itemId: 'add',
		text: 'Add Image',
		padding: '5px',
		margin: '5 5 5 5',
	}, {
		xtype: 'button',
		itemId: 'remove',
		text: 'Remove Image',
		padding: '5px',
		margin: '5 5 5 5'
	}]
});