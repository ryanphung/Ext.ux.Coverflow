/*
Main controller

Author: Ryan Phung
*/

Ext.define('Demo.controller.Main', {
    extend: 'Ext.app.Controller',
    stores: ['Images'],
    refs: [{
        selector: 'preview',
        ref: 'preview'
    }],
	images: [
		'resources/img/gorillaz-plasticbeach.jpg',
		'resources/img/kingsofleon-comearoundsunshine.jpg',
		'resources/img/kidrock-bornfree.jpg',
		'resources/img/recovery-recovery.jpg',
		'resources/img/lilwayne-iamnotahumanbeing.jpg',
		'resources/img/taylorswift-speaknow.jpg',
		'resources/img/thebandperry-thebandperry.jpg',
		'resources/img/maroon5-handsallover.jpg',
		'resources/img/mychemicalromance-dangerdays.jpg',
		'resources/img/ironmaiden-thefinalfrontier.jpg',
		'resources/img/order of the black - black label society.jpg',
		'resources/img/usher-raymondvraymond.jpg'
	],
    init: function () {
        this.control({
            'slideselection button#add': {
                click: this.onAddImage
            },
            'slideselection button#remove': {
                click: this.onRemoveImage
            }
        })
    },
    onAddImage: function () {
		var store = this.getImagesStore();
	
        var src = this.images[store.getCount() % 11];
		
		store.add({
			src: src
		});
    },
    onRemoveImage: function () {
		var store = this.getImagesStore();
		store.removeAt(store.getCount() - 1);
    }
});