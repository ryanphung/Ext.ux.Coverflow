/*
	app.js
	Author: Ryan Phung
	Main application
	Should not include any business logic except for application initiliazation
*/
Ext.application({
    name: 'Demo',
    autoCreateViewport: true, // once this is set to "true", ExtJS framework will automatically include app/View/Viewport.js
    controllers: ['Main'],
    launch: function() {
       // launch codes go here...
    }
});