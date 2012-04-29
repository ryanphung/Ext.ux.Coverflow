/*
Coverflow for ExtJS

Author: Ryan Phung
Re-written for ExtJS 4.0.7 by Ryan Phung with improvements / adjustments
based on Coverflow by Paul Bakaus and Addy Osmani written for jQuery

Github: http://github.com/ryanphung/Ext.ux.Coverflow
*/

Ext.define('Ext.ux.Coverflow', {

    /* Begin Definitions */
    extend: 'Ext.view.View',
    alias: 'widget.coverflow',
    requires: ['Ext.fx.PropertyHandler'],
    /* End Definitions */
    
    /*
    * @cfg {Number} item
    * The item selected by default when this component is rendered
    */
    item: 0,
    
    /*
    * @cfg {String} cls
    * The css class to be applied to the outer element of this component
    */
    cls: 'coverflow-wrapper',
    
    /*
    * @cfg {Boolean} center
    * True to center the items
    */
    center: true,
    
    /*
    * @cfg {Boolean} recenter
    * True to animate the base element when item selection change
    */
    recenter: true,
    
    /*
    * @cfg {Number} itemWidth
    * The width of each item, when not selected
    */
    itemWidth: 260,
      
    /*
    * @cfg {Number} itemHeight
    * The width of each item, when not selected
    */
    itemHeight: 260,
    
	/*
    * @cfg {Number} selectedItemScale
    * The factor used to scale up selected items
    */
	selectedItemScale: 1.3,
	
    /*
    * @cfg {String} orientation
    * Orientation of the component. Possible values: 'horizontal', 'vertical'.
    */
    orientation: 'horizontal',
    
    /*
    * @cfg {Number} duration
    * Duration of the animation, in milliseconds
    */
    duration: 450,
    
    /*
    * @cfg {Number} alpha
    * Alpha of the unselected items. This is used to control transparency.
    */
    alpha: 80,
    
    /*
    * @cfg {String} tpl
    * Template used to render the component.
    */
    tpl: '<div class="coverflow"/>' +
            '<tpl for=".">' +
                '<div class="coverflow-item">' +
                  '<img class="coverflow-image" src="{src}"/>' +
                '</div>' +
            '</tpl>' +
        '</div>',
    
    /*
    * @cfg {String} itemSelector
    * Selector used to identify the items in the DOM structure
    */
    itemSelector: 'div.coverflow-item',
    
    /*
    * @cfg {String} imageSelector
    * Selector used to identify the item images in the DOM structure
    */
    imageSelector: 'div.coverflow-item img.coverflow-image',
    
    /*
    * @cfg {String} emptyText
    * Text to displayed when images are not available
    */
    emptyText: 'No images available',
    
    /*
    * @cfg {Number} wheelStep
    * The wheel step to control scrolling navigation.
    * The smaller the step, the faster scrolling is.
    */
    wheelStep: 3,
    
    initComponent: function () {
        var me = this;

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
        
        // applying the initial config to overwrite default values
        Ext.apply(this, this.initialConfig);
        
        /* Begin additional properties */
        this.vendorPrefix = getPrefix('transform');
		
		if (this._isFunnyBrowser())
			this.compensateScale = this.selectedItemScale;
		else
			this.compensateScale = 1;
		
        this.props = this.orientation == 'vertical' ? ['height', 'Height', 'top', 'Top', 't', 'left'] : ['width', 'Width', 'left', 'Left', 'l', 'top'];
        this.itemGap = 0.5 * this.itemWidth;
        this.current = this.item;
        this.tpl = new Ext.XTemplate(this.tpl); // TODO: check whether tpl is string
        /* End additional properties */

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
	
	_isFunnyBrowser: function() {
		return (this.vendorPrefix == 'ms' || this.vendorPrefix == "");
	},
    
    afterRender: function() {
        this.callParent(arguments);
        
        this.on({
            viewready: function() {
                console.log('viewready');
                this.innerElement = Ext.get(this.getEl().select('div.coverflow').first());
                
                this._scaleItems();
                
                //Jump to the first item
                this._refresh(1, 0, this.current);
                this._adjustBodyOffset();
                
                this.getEl().addKeyMap({
                    key: Ext.EventObject.LEFT,
                    fn: this.onKeyLeft,
                    scope: this
                });
                
                this.getEl().addKeyMap({
                    key: Ext.EventObject.RIGHT,
                    fn: this.onKeyRight,
                    scope: this
                });
                
                this.getEl().addKeyMap({
                    key: Ext.EventObject.UP,
                    fn: this.onKeyUp,
                    scope: this
                });
                
                this.getEl().addKeyMap({
                    key: Ext.EventObject.DOWN,
                    fn: this.onKeyDown,
                    scope: this
                });
                
            },
            resize: function(self, adjWidth, adjHeight, eOpts) {
                console.log('resized');
                if (this.innerElement) {
                    this._adjustBodyOffset();
                }
            },
            itemclick: function(self, record, item, index, e, eOpts) {
                this.select(index);
            }
        });
        
        this.mon(Ext.getDoc(), {
            scope: this,
            mousewheel: this.onMouseWheel
        });
    },
    
    /*
    * @private
    * Scale the items and inner elements to the size specified in configuration
    */
    _scaleItems: function() {
        var me = this;
    
        // Scaling item elements
        this.getEl().select(this.itemSelector).each(function(el) {
            el.setWidth(me.itemWidth * me.compensateScale);
            el.setHeight(me.itemHeight * me.compensateScale);
        });
        
        // Scaling images
        this.getEl().select(this.imageSelector).each(function(el) {
            el.setWidth(me.itemWidth * me.compensateScale);
            el.setHeight(me.itemHeight * me.compensateScale);
        });
    },
    
    //@override
    refresh: function() {
        console.log('before refresh');
        this.callParent(arguments);
        console.log('after refresh');
        
        this.innerElement = Ext.get(this.getEl().select('div.coverflow').first());
        this._scaleItems();
        this._refresh(1, 0, this.current);
        this._adjustBodyOffset();
    },
    
    onMouseWheel: function(event) {
        if (event.browserEvent.wheelDeltaY < -this.wheelStep) {
            this.selectPrevious();
        } else if (event.browserEvent.wheelDeltaY > this.wheelStep) {
            this.selectNext();
        }
    },
    
    onKeyLeft: function() {
        this.selectPrevious();
    },
    
    onKeyRight: function() {
        this.selectNext();
    },
    
    onKeyUp: function() {
        this.selectPrevious();
    },
    
    onKeyDown: function() {
        this.selectNext();
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
        css[this.props[0]] = (this.getStore().getCount() + 1) * this.itemWidth * this.compensateScale + 'px';
        css[this.props[5]] = this.itemHeight * 0.4 + 'px';
        this.innerElement.applyStyles(css);
    },
    
    _adjustBodyOffset: function () {
        //center the actual parent's left side within it's parent
        var css = [];
        css[this.props[2]] = this._calculateBodyOffset() + 'px';
        this.innerElement.applyStyles(css);
    },
    
    _calculateBodyOffset: function () {
        var innerElement = this.innerElement;

        return (this.recenter ? -this.current * this.itemGap : 0)
        +
        (this.center ? parseInt(this.getEl().dom['offset' + this.props[1]], 10) / 2 - this.itemWidth / 2 : 0) // Center the items container
        -
        (this.center ? innerElement.getPadding(this.props[4]) : 0) // Subtract the padding of the body
        -
        (this.center ? innerElement.getMargin(this.props[4]) : 0) // Subtract the margin of the body
    },
    
    selectNext: function() {
        if (this.current < this.getStore().getCount() - 1) {
            this.select(this.current + 1);
        }
    },
    
    selectPrevious: function() {
        if (this.current > 0) {
            this.select(this.current - 1);
        }
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

		/*
		Explanation of "mod":
			mod is 1 if the item should be rendered in unselected mode
			mod is 0 if the iem should be rendered in selected mode
			mod is between 0 and 1 when half-state rendering is needed
		*/
		
        var alpha = this.alpha + (100 - this.alpha) * (1 - mod);

		var M = [];
			M[0] = [], M[1] = [];
			M[0][0] = 1;
			M[0][1] = mod * (side == 'right' ? 0.05 : -0.05);
			M[1][0] = mod * (side == 'right' ? -0.2 : 0.2);
			M[1][1] = 1;
		
        if (me._isFunnyBrowser()) {
			var scale = 1/(1 + mod * (this.selectedItemScale - 1));
			M[0][0] *= scale, M[0][1] *= scale, M[1][0] *= scale, M[1][1] *= scale;
			
            var filter = 
                "progid:DXImageTransform.Microsoft.Matrix(M11=" + M[0][0] + ", M12=" + M[0][1] + ", M21=" + M[1][0] + ", M22=" + M[1][1] + ", sizingMethod='auto expand')"
                + " progid:DXImageTransform.Microsoft.Alpha(opacity=" + alpha + ")";
            ;
            
            // do not apply the filter if it's the same!
            if (me.getNode(i).style['filter'] !== filter) {
				css['filter'] = filter;
            }
			
			var translateX = i * me.itemGap + (side == 'right' ? -me.itemGap : me.itemGap) * mod;//((-i * (me.itemSize/2)));// + (side == 'right'? -me.itemSize/2 : me.itemSize/2) * mod);
			
			// Compensation because we have scaled up the images in IE
			var compensateX1 = -(this.selectedItemScale - 1) * this.itemWidth;
			
			// Compensation for IE transformation origin errors
			// Based on this awesome explanation: http://extremelysatisfactorytotalitarianism.com/blog/?p=922
			var compensateX2 = (1 - Math.abs(M[0][0])) * this.itemWidth * this.compensateScale / 2 - Math.abs(M[0][1]) * this.itemHeight * this.compensateScale / 2;
			var compensateY2 = (1 - Math.abs(M[1][1])) * this.itemHeight * this.compensateScale / 2 - Math.abs(M[1][0]) * this.itemWidth * this.compensateScale / 2;
			
			css.left = translateX + compensateX1 + compensateX2 + 'px';
			css.top = compensateY2 + 'px';
        } else {
			css[me.vendorPrefix + 'Transform'] = 'matrix(1,' + (mod * (side == 'right' ? -0.3 : 0.3)) + ',' + mod * (side == 'right' ? 0.05 : -0.05) + ',1,0,0) scale(' + (1 + ((1 - mod) * (this.selectedItemScale - 1))) + ')';
			
			css[me.props[2]] = i * me.itemGap + (side == 'right' ? -me.itemGap : me.itemGap) * mod;
            
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