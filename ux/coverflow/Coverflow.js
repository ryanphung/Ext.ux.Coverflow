Ext.define('Ext.ux.coverflow.Coverflow', {
    extend: 'Ext.Container',
    alias: 'widget.coverflow',
    orientation: 'horizontal',
    item: 0,
    cls: 'coverflow-wrapper',
    center: true,
    // If false, element's base position isn't touched in any way
    recenter: true,
    // If false, the parent element's position doesn't get animated while items change
    initComponent: function () {
        var me = this,
            conf = this.initialConfig;
        this.callParent(arguments);

        function getPrefix(prop) {
            var prefixes = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'],
                elem = document.createElement('div'),
                upper = prop.charAt(0).toUpperCase() + prop.slice(1),
                pref = "",
                len = 0;

            for (len = prefixes.length; len--;) {
                if ((prefixes[len] + upper) in elem.style) {
                    pref = (prefixes[len]);
                }
            }

            if (prop in elem.style) {
                pref = (prop);
            }
            return pref;
        }

        this.vendorPrefix = getPrefix('transform');
        this.itemWidth = conf.itemWidth ? conf.itemWidth : '260';
        this.itemHeight = conf.itemWidth ? conf.itemHeight : '260';
        this.props = conf.orientation == 'vertical' ? ['height', 'Height', 'top', 'Top', 't'] : ['width', 'Width', 'left', 'Left', 'l'];
        this.itemSize = 1.2 * this.itemWidth;
        this.duration = conf.duration;
        this.current = conf.item ? conf.item : 0; // initial item
		this.alpha = conf.alpha ? conf.alpha: 80;
    },

    // add custom processing to the onRender phase
    // this will be called before the component is rendered
    onRender: function () {
        var me = this;
        this.callParent(arguments);
        this.add({
            xtype: 'container',
            itemId: 'body',
            width: 0,
            height: this.itemHeight * 1.5,
            //padding: this.itemHeight * 0.4,
            margin: this.itemHeight * 0.4,
            cls: 'coverflow'
        });

        //Jump to the first item
        this._refresh(1, 0, this.current);
    },

    afterLayout: function () {
        //center the actual parent's left side within it's parent
        var css = [];
        css[this.props[2]] = this._calculateBodyOffset() + 'px';
        this.getComponent('body').getEl().applyStyles(css);
    },

    _adjustBodySize: function () {
        this.getComponent('body').setWidth((this.getImages().length + 1) * this.itemWidth);
    },

    getImages: function () {
        return this.getComponent('body').items ? this.getComponent('body').items : [];
    },

    addImage: function (src) {
        var imageId = this.getImages().length;
        this.getComponent('body').add({
            imageId: imageId,
            xtype: 'coverflow-image',
            src: src,
            position: 'relative',
            float: 'left',
            // margin: -this.itemWidth / 7,
            width: this.itemWidth,
            height: this.itemWidth
        });

        this.mon(this.getImages().getAt(imageId).getEl(), 'click', function (e, t, options) {
            this.select(options.imageId);
        }, this, {
            imageId: imageId
        });
        this._refresh(1, 0, this.current);

    },

    removeImage: function (index) {
        var me = this;
        // remove all listeners in all items after the removed item
        this.getImages().each(function (item) {
            if (item.imageId >= index) {
                me.mun(item.getEl(), 'click');
            }
        });

        this.getComponent('body').remove(index);

        this.getImages().each(function (item) {
            // adjusting the imageId of all items after the removed item
            if (item.imageId > index) {
                item.imageId--;
                me.mon(item.getEl(), 'click', function (e, t, options) {
                    this.select(options.imageId);
                }, me, {
                    imageId: item.imageId
                });
            }
        });

        if (this.current > index && this.current > 0) {
            this.select(this.current - 1);
        }
        
		this._refresh(1, 0, this.current);
    },

    _calculateBodyOffset: function () {
        var body = this.getComponent('body');

        return (this.recenter ? -this.current * this.itemSize / 3 : 0) // TODO-this might not be itemSize!
        +
        (this.center ? parseInt(this.getEl().dom['offset' + this.props[1]], 10) / 2 - this.itemWidth / 2 : 0) // Center the items container
        -
        (this.center ? body.getEl().getPadding(this.props[4]) : 0) // Subtract the padding of the body
        -
        (this.center ? body.getEl().getMargin(this.props[4]) : 0) // Subtract the margin of the body
    },
    select: function (item, noPropagation) {
        this.previous = this.current;
        this.current = !isNaN(parseInt(item, 10)) ? parseInt(item, 10) : this.getImages().getAt(item);
        //Don't animate when clicking on the same item
        if (this.previous == this.current) return false;
        //Overwrite $.fx.step.coverflow everytime again with custom scoped values for this specific animation
        var me = this,
            to = Math.abs(me.previous - me.current) <= 1 ? me.previous : me.current + (me.previous < me.current ? -1 : 1);
        //$.fx.step.coverflow = function(fx) { me._refresh(fx.now, to, me.current); };
        // 1. Stop the previous animation
        // 2. Animate the parent's left/top property so the current item is in the center
        // 3. Use our custom coverflow animation which animates the item
        var animation = {
            //coverflow: 1
        };
        var body = this.getComponent('body');
        animation[this.props[2]] = (this._calculateBodyOffset());
        // TODO
        //Trigger the ‘select’ event/callback
        //if (!noPropagation) this._trigger('select', null, this._uiHash());
        
		body.getEl().animate({
            to: animation,
            duration: this.duration,
            easing: 'easeOut'
        });

        var stepsNo = 4;
        var keyframes = [];
        for (var i = 0; i <= stepsNo; i++) {
            keyframes[100 * i / stepsNo + '%'] = {};
        }
		
		this.getEl().animate({
			keyframes: keyframes,
            duration: this.duration,
            easing: 'easeOut',
			listeners: {
                    keyframe: function (self, keyframe, options) {
                        var step = (keyframe - 1) / stepsNo;
                        var css = me._refresh(step, to, me.current);
                    },
                    afteranimate: function (self, time, options) {
                        var css = me._refresh(1, to, me.current);
                    }
                }
        });

        /*this.getImages().each(function (item, i, len) {
            item.getEl().animate({
                keyframes: keyframes,
                duration: this.duration,
                easing: 'ease0ut',
                listeners: {
                    keyframe: function (self, keyframe, options) {
                        var step = (keyframe - 1) / stepsNo;
                        //console.log(item.imageId + ' | ' + keyframe + ' | ' + step);
                        var css = me._calculateImageStyle(item, i, step, to, me.current);
                        item.getEl().applyStyles(css);
                    },
                    afteranimate: function (self, time, options) {
                        var css = me._calculateImageStyle(item, i, 1, to, me.current);
                        item.getEl().applyStyles(css);
                    }
                }
            });
        });*/
        //this._refresh(1, 0, this.current);
    },

    _calculateImageStyle: function (item, i, state, from, to) {
        var me = this;
        var side = (i == to && from - to < 0) || i - to > 0 ? 'left' : 'right',
            mod = i == to ? (1 - state) : (i == from ? state : 1),
            before = (i > from && i != to),
            css = {
                zIndex: me.getImages().length + (side == "left" ? to - i : i - to)
            };

		var alpha = this.alpha + (100 - this.alpha) * (1 - mod);

        if (me.vendorPrefix == 'ms' || me.vendorPrefix == "") {
			
		
			var filter = 
				"progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand', M11=1, M12=" + mod * (side == 'right' ? 0.05 : -0.05) + ", M21=" + (mod * (side == 'right' ? -0.2 : 0.2)) + ", M22=1)"
				+ " progid:DXImageTransform.Microsoft.Alpha(opacity=" + alpha + ")";
			;
			
			// do not apply the filter if it's the same!
			if (item.getEl().dom.style['filter'] !== filter) {
				css['filter'] = filter;
			}
			
			css[me.props[2]] = ( (-i * (me.itemSize/2)) + (side == 'right'? -me.itemSize/2 : me.itemSize/2) * mod );
            //css['filter'] = "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand', M11=" + (1 - mod * 0.6) + ", M12=" + mod * (side == 'right' ? 0.1 : -0.1) + ", M21=" + (mod * (side == 'right' ? -0.3 : 0.3)) + ", M22=1";
            			
			css.width = me.itemWidth * (1 + ((1 - mod) * 0.5));
            css.height = css.width * (me.itemHeight / me.itemWidth);
            css.top = - css.height / 4 + me.itemHeight / 8;
			
			// Compatibility with stricter IE modes
			css[me.props[2]] += 'px';
			css.width += 'px';
			css.height += 'px';
			css.top += 'px';
			
			/*if (i == me.current) {
                
                //css.left -= me.itemWidth / 6 - 50;
				css.left -= me.itemWidth / 6 - 40;
            } else {
                
                if (side == "left") {
                    css.left -= me.itemWidth / 5 - 50;
                }
            } //end if*/
        } else {
            css[me.vendorPrefix + 'Transform'] = 'matrix(' + (1 - mod * 0.6) + ',' + (mod * (side == 'right' ? -0.3 : 0.3)) + ',' + mod * (side == 'right' ? 0.1 : -0.1) + ',1,0,0) scale(' + (1 + ((1 - mod) * 0.5)) + ')';
			//css[me.vendorPrefix + 'Transform'] = 'matrix(0,' + (mod * (side == 'right' ? -0.3 : 0.3)) + ',' + mod * (side == 'right' ? 0.1 : -0.1) + ',1,0,0) scale(' + (1 + ((1 - mod) * 0.5)) + ')';
			css[me.vendorPrefix + 'Transform'] = 'matrix(1,' + (mod * (side == 'right' ? -0.3 : 0.3)) + ',' + mod * (side == 'right' ? 0.05 : -0.05) + ',1,0,0) scale(' + (1 + ((1 - mod) * 0.5)) + ')';
            css[me.props[2]] = ((-i * (me.itemSize / 2)) + (side == 'right' ? -me.itemSize / 2 : me.itemSize / 2) * mod);
			
			css['opacity'] = alpha / 100;
        }
        return css;
    },
    _refresh: function (state, from, to) {
        var me = this,
            offset = null;
        this.getImages().each(function (item, i, len) {
            var css = me._calculateImageStyle(item, i, state, from, to);
            item.getEl().applyStyles(css);
        });
        // TODO
        //this.getEl().parent().scrollTop(0);
        this._adjustBodySize();
    }
});