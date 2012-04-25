/*
Coverflow demo application

Author: Ryan Phung
*/

Ext.Loader.setPath('Ext.ux.Coverflow', 'ux/Coverflow.js');

Ext.application({
    name: 'Demo',
    autoCreateViewport: true,
    controllers: ['Main'],
    launch: function() {
       // launch codes go here...
    }
});