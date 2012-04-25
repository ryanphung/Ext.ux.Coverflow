Ext.define('Demo.view.Viewport', {
    extend: 'Ext.container.Viewport',
    requires: ['Demo.view.Preview', 'Demo.view.Selection'],
    layout: 'fit',
    initComponent: function () {
		Ext.define('Image', {
			extend: 'Ext.data.Model',
			fields: [
				{ name:'src', type:'string' }
			]
		});

		Ext.create('Ext.data.Store', {
			id:'imagesStore',
			model: 'Image',
			data: [
				{ src:'resources/img/gorillaz-plasticbeach.jpg' },
				{ src:'resources/img/kingsofleon-comearoundsunshine.jpg' },
				{ src:'resources/img/kidrock-bornfree.jpg' },
				{ src:'resources/img/recovery-recovery.jpg' }
			]
		});
		
		var preview = Ext.create('Demo.view.Preview', {
			store: Ext.data.StoreManager.lookup('imagesStore'),
			itemSelector: 'div.thumb-wrap',
			/*width: 1024,
			height: 350,*/
            itemWidth: 200,
            itemHeight: 200/*,
			layout: 'fit'*/
		});
	
        this.items = {
            xtype: 'panel',
            dockedItems: [{
                dock: 'top',
                xtype: 'panel',
                height: 350,
				layout: 'fit',
                items: [preview]
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