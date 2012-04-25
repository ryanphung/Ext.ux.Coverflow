/*
Coverflow for ExtJS

Author: Ryan Phung
Re-written for ExtJS 4.0.7 by Ryan Phung with improvements / adjustments
based on Coverflow by Paul Bakaus and Addy Osmani written for jQuery

Github: http://github.com/ryanphung/Ext.ux.Coverflow
*/

Ext.define('Ext.ux.Coverflow', {
    extend: 'Ext.view.View',
    alias: 'widget.coverflow',
	requires: ['Ext.fx.PropertyHandler'],
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
        this.props = conf.orientation == 'vertical' ? ['height', 'Height', 'top', 'Top', 't', 'left'] : ['width', 'Width', 'left', 'Left', 'l', 'top'];
        this.itemSize = 1.2 * this.itemWidth;
        this.duration = conf.duration ? conf.duration : 450;
        this.current = conf.item ? conf.item : 0; // initial item
		this.alpha = conf.alpha ? conf.alpha: 80;
		this.data = [];
		this.tpl = conf.tpl? conf.tpl : new Ext.XTemplate(
			'<div class="coverflow"/>',
				'<tpl for=".">',
					'<div class="coverflow-item">',
					  '<img class="coverflow-image" src="{src}" width="' + this.itemWidth + '" height="' + this.itemHeight + '"/>',
					'</div>',
				'</tpl>',
			'</div>'
		);
		this.store = conf.store;
		this.itemSelector = 'div.coverflow-item';
		this.emptyText = 'No images available';
		
        this.callParent(arguments);

		Ext.fx.PropertyHandler['coverflow'] = {
			pixelDefaultsRE: /width|height|top$|bottom$|left$|right$/i,
            unitRE: /^(-?\d*\.?\d*){1}(em|ex|px|in|cm|mm|pt|pc|%)*$/,
            scrollRE: /^scroll/i,

            computeDelta: function(from, end, damper, initial, attr) {
                damper = (typeof damper == 'number') ? damper : 1;
                var unitRE = this.unitRE,
                    match = unitRE.exec(from),
                    start, units;
                if (match) {
                    from = match[1];
                    units = match[2];
                    if (!this.scrollRE.test(attr) && !units && this.pixelDefaultsRE.test(attr)) {
                        units = 'px';
                    }
                }
                from = +from || 0;

                match = unitRE.exec(end);
                if (match) {
                    end = match[1];
                    units = match[2] || units;
                }
                end = +end || 0;
                start = (initial != null) ? initial : from;
                return {
                    from: from,
                    delta: (end - start) * damper,
                    units: units
                };
            },

            get: function(from, end, damper, initialFrom, attr) {
                var ln = from.length,
                    out = [],
                    i, initial, res, j, len;
                for (i = 0; i < ln; i++) {
                    if (initialFrom) {
                        initial = initialFrom[i][1].from;
                    }
                    if (Ext.isArray(from[i][1]) && Ext.isArray(end)) {
                        res = [];
                        j = 0;
                        len = from[i][1].length;
                        for (; j < len; j++) {
                            res.push(this.computeDelta(from[i][1][j], end[j], damper, initial, attr));
                        }
                        out.push([from[i][0], res]);
                    }
                    else {
                        out.push([from[i][0], this.computeDelta(from[i][1], end, damper, initial, attr)]);
                    }
                }
                return out;
            },

            set: function(values, easing) {
				console.log(easing);
				var to = Math.abs(me.previous - me.current) <= 1 ? me.previous : me.current + (me.previous < me.current ? -1 : 1);
				
				me._refresh(easing, to, me.current);
				
                var ln = values.length,
                    out = [],
                    i, val, res, len, j;
                for (i = 0; i < ln; i++) {
                    val  = values[i][1];
                    if (Ext.isArray(val)) {
                        res = [];
                        j = 0;
                        len = val.length;
                        for (; j < len; j++) {
                            res.push(val[j].from + (val[j].delta * easing) + (val[j].units || 0));
                        }
                        out.push([values[i][0], res]);
                    } else {
                        out.push([values[i][0], val.from + (val.delta * easing) + (val.units || 0)]);
                    }
                }
                return out;
            }
		};
    },
	
	afterRender: function() {
		this.callParent(arguments);
		
		this.on({
			viewready: function() {
				console.log('viewready');
				this.innerElement = Ext.get(this.getEl().select('div.coverflow').first());
				//Jump to the first item
				this._refresh(1, 0, this.current);
				this._adjustBodyOffset();
			},
			resize: function(self, adjWidth, adjHeight, eOpts) {
				console.log('resized');
				if (this.innerElement) {
					this._adjustBodyOffset();
				}
			},
			itemclick: function(self, record, item, index, e, eOpts) {
				this.select(index);
			},
		});
		
		/*this.mon(this.getStore(), 'add', this.onStoreAdd, this);
		
		this.mon(this.getStore(), 'update', this.onStoreUpdate, this);
		
		this.mon(this.getStore(), 'remove', this.onStoreRemove, this);*/
	},
	
	//@override
	refresh: function() {
		console.log('before refresh');
		this.callParent(arguments);
		console.log('after refresh');
		
		this.innerElement = Ext.get(this.getEl().select('div.coverflow').first());
		this._refresh(1, 0, this.current);
		this._adjustBodyOffset();
	},
	
	/*doAdd: function(nodes, records, index) {
		this.callParent(arguments);
		console.log('add ' + records.length + ' records at ' + index);
		
		this._refresh(1, 0, this.current);
		this._adjustBodyOffset();
	},*/
	
	onStoreUpdate: function(store, record, index, operation, eOpts) {
		console.log(operation + ' record at ' + index);
	},
	
	onStoreRemove: function(store, record, index, eOpts) {
		console.log('remove records at ' + index);
	},

    _adjustBodySize: function () {
		var css = [];
		css[this.props[0]] = (this.getStore().getCount() + 1) * this.itemWidth;
		css[this.props[5]] = this.itemHeight * 0.4 + 'px';
		this.innerElement.applyStyles(css);
    },
	
	_adjustBodyOffset: function () {
		//center the actual parent's left side within it's parent
		var css = [];
		css[this.props[2]] = this._calculateBodyOffset() + 'px';
		this.innerElement.applyStyles(css);
    },

    /*getImages: function () {
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
    },*/

    _calculateBodyOffset: function () {
        var innerElement = this.innerElement;

        return (this.recenter ? -this.current * this.itemSize / 3 : 0) // TODO-this might not be itemSize!
        +
        (this.center ? parseInt(this.getEl().dom['offset' + this.props[1]], 10) / 2 - this.itemWidth / 2 : 0) // Center the items container
        -
        (this.center ? innerElement.getPadding(this.props[4]) : 0) // Subtract the padding of the body
        -
        (this.center ? innerElement.getMargin(this.props[4]) : 0) // Subtract the margin of the body
    },

    select: function (item, noPropagation) {
        this.previous = this.current;
        this.current = !isNaN(parseInt(item, 10)) ? parseInt(item, 10) : this.getStore().getAt(item);
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
        animation[this.props[2]] = (this._calculateBodyOffset());
		animation['coverflow'] = 1;
        // TODO
        //Trigger the ‘select’ event/callback
        //if (!noPropagation) this._trigger('select', null, this._uiHash());
        
		if (this.myAnim)
			this.myAnim.end();

		this.myAnim = Ext.create('Ext.fx.Anim', {
			target: this.innerElement,
			duration: this.duration,
			to: animation,
			easing: 'easeOut'
		});
    },

    _calculateImageStyle: function (item, i, state, from, to) {
        var me = this;
        var side = (i == to && from - to < 0) || i - to > 0 ? 'left' : 'right',
            mod = i == to ? (1 - state) : (i == from ? state : 1),
            before = (i > from && i != to),
            css = {
                zIndex: me.getStore().getCount() + (side == "left" ? to - i : i - to)
            };

		var alpha = this.alpha + (100 - this.alpha) * (1 - mod);

        if (me.vendorPrefix == 'ms' || me.vendorPrefix == "") {
			
		
			var filter = 
				"progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand', M11=1, M12=" + mod * (side == 'right' ? 0.05 : -0.05) + ", M21=" + (mod * (side == 'right' ? -0.2 : 0.2)) + ", M22=1)"
				+ " progid:DXImageTransform.Microsoft.Alpha(opacity=" + alpha + ")";
			;
			
			// do not apply the filter if it's the same!
			if (me.getNode(i).style['filter'] !== filter) {
				css['filter'] = filter;
			}
			
			css[me.props[2]] = ( (-i * (me.itemSize/2)) + (side == 'right'? -me.itemSize/2 : me.itemSize/2) * mod );
            			
			css.width = me.itemWidth * (1 + ((1 - mod) * 0.5));
            css.height = css.width * (me.itemHeight / me.itemWidth);
            css.top = - css.height / 4 + me.itemHeight / 8;
			
			// Compatibility with stricter IE modes
			css[me.props[2]] += 'px';
			css.width += 'px';
			css.height += 'px';
			css.top += 'px';
			
			var imgCss = [];
			imgCss.width = css.width;
			imgCss.height = css.height;
			
			Ext.fly(Ext.fly(me.getNode(i)).select('img.coverflow-image').first()).applyStyles(imgCss);
			
			/*if (i == me.current) {
                
                //css.left -= me.itemWidth / 6 - 50;
				css.left -= me.itemWidth / 6 - 40;
            } else {
                
                if (side == "left") {
                    css.left -= me.itemWidth / 5 - 50;
                }
            } //end if*/
        } else {
            //css[me.vendorPrefix + 'Transform'] = 'matrix(' + (1 - mod * 0.6) + ',' + (mod * (side == 'right' ? -0.3 : 0.3)) + ',' + mod * (side == 'right' ? 0.1 : -0.1) + ',1,0,0) scale(' + (1 + ((1 - mod) * 0.5)) + ')';
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
        this.getStore().each(function (item, i, len) {
            var css = me._calculateImageStyle(item, i, state, from, to);
            Ext.fly(me.getNode(i)).applyStyles(css);
        });
        this._adjustBodySize();
    }
});