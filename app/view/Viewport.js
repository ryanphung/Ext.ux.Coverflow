Ext.define('Demo.view.Viewport', {
    extend: 'Ext.container.Viewport',
    requires: ['Demo.view.Preview', 'Demo.view.Selection'],
    layout: 'fit',
    initComponent: function () {
        this.items = {
            xtype: 'panel',
            dockedItems: [{
                dock: 'top',
                xtype: 'panel',
                height: 350,
                items: [{
                    xtype: 'preview',
                    width: 1024,
                    height: 350,
                    itemWidth: 200,
                    itemHeight: 200
                }]
            }],
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [{
                xtype: 'slideselection'
            }]
        };
        this.callParent(arguments);
    }
});