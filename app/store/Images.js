/*
Image store

Author: Ryan Phung
*/

Ext.define('Demo.store.Images', {
    extend: 'Ext.data.Store',
    requires: 'Demo.model.Image',
	model: 'Demo.model.Image',
	data: [
		{ src:'resources/img/gorillaz-plasticbeach.jpg' },
		{ src:'resources/img/kingsofleon-comearoundsunshine.jpg' },
		{ src:'resources/img/kidrock-bornfree.jpg' },
		{ src:'resources/img/recovery-recovery.jpg' }
	]
});