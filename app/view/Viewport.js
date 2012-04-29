/*
Main viewport

Author: Ryan Phung
*/

Ext.define('Demo.view.Viewport', {
    extend: 'Ext.container.Viewport',
    requires: ['Ext.ux.Coverflow', 'Demo.view.Selection'],
    layout: 'fit',
    initComponent: function () {
        this.items = {
            xtype: 'panel',
            dockedItems: [{
                dock: 'top',
                xtype: 'panel',
                height: 500,
				layout: 'fit',
				border: false,
                items: [{
                    xtype: 'coverflow',
                	store: 'Images',
                	margin: '5 5 5 5',
                	border: false,
                    itemWidth: 200,
                    itemHeight: 200
                }]
            }],
            items: [{
                xtype: 'slideselection',
                border: false
            }]
        };
        this.callParent(arguments);
    }
});