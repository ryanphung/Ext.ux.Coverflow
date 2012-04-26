/*
Coverflow demo application

Author: Ryan Phung
*/

// TODO:
// 1. Making things more configurable:
// - Support images of different sizes (perhaps set maxItemWidth / maxItemHeight or scales?)
// - Support different angles
// - Support different size of the "selected" items
// - Support mouse scroll

Ext.Loader.setPath('Ext.ux.Coverflow', 'ux/Coverflow.js');

Ext.application({
    name: 'Demo',
    autoCreateViewport: true,
    models: ['Image'],
    stores: ['Images'],
    controllers: ['Main'],
    launch: function() {
       // launch codes go here...
    }
});