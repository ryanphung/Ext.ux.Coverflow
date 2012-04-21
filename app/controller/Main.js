Ext.define('Demo.controller.Main', {
    extend: 'Ext.app.Controller',
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
        var src = this.images[this.getPreview().getImages().length % 11];
        this.getPreview().addImage(src);
    },
    onRemoveImage: function () {
        this.getPreview().removeImage(0);
    }
});