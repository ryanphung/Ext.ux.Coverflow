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
        this.props = this.orientation == 'vertical' ? ['height', 'Height', 'top', 'Top', 't', 'left'] : ['width', 'Width', 'left', 'Left', 'l', 'top'];
        this.itemSize = 1.2 * this.itemWidth;
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
    },
    
    /*
    * @private
    * Scale the items and inner elements to the size specified in configuration
    */
    _scaleItems: function() {
        var me = this;
    
        // Scaling item elements
        this.getEl().select(this.itemSelector).each(function(el) {
            el.setWidth(me.itemWidth);
            el.setHeight(me.itemHeight);
        });
        
        // Scaling images
        this.getEl().select(this.imageSelector).each(function(el) {
            el.setWidth(me.itemWidth);
            el.setHeight(me.itemHeight);
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