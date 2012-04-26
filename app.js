/*
Coverflow demo application

Author: Ryan Phung
*/

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