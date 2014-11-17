// Copyright (c) 2012 Tim Niblett All Rights Reserved.
//
// File:        cilogiLeafletMap.java  (10/05/12)
// Author:      tim
//
// Copyright in the whole and every part of this source file belongs to
// Tim Niblett (the Author) and may not be used, sold, licenced, transferred, 
// copied or reproduced in whole or in part in any manner or form or in 
// or on any media to any person other than in accordance with the terms of 
// The Author's agreement or otherwise without the prior written consent of
// The Author.
//

(function(cilogiBase, log) {

    var pointerDown = L.Browser.touch ? 'touchstart' : 'mousedown',
        pointerUp   = L.Browser.touch ? 'touchend'   : 'mouseup',
        pointerOut  = L.Browser.touch ? 'touchcancel' : 'mouseout';

    var page = document.getElementById('page'),
        ua = navigator.userAgent,
        iPhone = ~ua.indexOf('iPhone') || ~ua.indexOf('iPod'),
        iPad = ~ua.indexOf('iPad'), // on ipad is all ok
        ios = iPhone || iPad,
        // Detect if this is running as a fullscreen app from the homescreen
        fullScreen = window.navigator.standalone,
        android = ~ua.indexOf('Android');

    function addressBarHeight() {
        return ios ? 60 : 0;
    }

    function upperPower2(dimension) {
        return Math.pow(2.0, Math.ceil(Math.log(dimension)/Math.log(2.0)));
    }

    function maxLevel(width, height) {
        var wLog = Math.ceil(Math.log(width)/Math.log(2.0));
        var hLog = Math.ceil(Math.log(height)/Math.log(2.0));
        return (wLog < hLog) ? hLog - 8  : wLog - 8;
    }

    cilogiBase.maxLevel = maxLevel;

    function size(width, height) {
        var max = (width < height) ? height : width;
        return upperPower2(max);
    }

    // scale something that looks like "100%" to "150%" if amount is "1.5"
    function scaleFont(fontSize, amount) {
        var sub = fontSize.slice(0, -1);
        var size = parseFloat(sub);
        var resultFloat = Math.floor(size * amount);
        var out = resultFloat + "%";
        return out;
    }

    function bounds(width, height) {
        var max = size(width, height);
        var wFraction = 1 - width/max;
        var hFraction = 1 - height/max;
        return new L.LatLngBounds(new L.LatLng(1-hFraction/2.0, 1-wFraction/2.0), new L.LatLng(hFraction/2.0, wFraction/2.0));
    }

    cilogiBase.bounds = bounds;

    var pan = function(bounds) {
		var viewBounds = this.getBounds(),
		    viewSw = this.project(viewBounds.getSouthWest()),
		    viewNe = this.project(viewBounds.getNorthEast()),
		    sw = this.project(bounds.getSouthWest()),
		    ne = this.project(bounds.getNorthEast()),
		    dx = 0,
		    dy = 0,
		    limit = 128;

        //console.log("viewNe " + viewNe + " viewSW " + viewSw + " ne " + ne + " sw " + sw);

        if (ne.y - viewSw.y < limit) {
            dy = -(limit - (ne.y - viewSw.y));
        }  else if (viewNe.y - sw.y < limit) {
            dy = limit - (viewNe.y - sw.y);
        }

        if (ne.x - viewSw.x < limit) {
            dx = -(limit - (ne.x - viewSw.x));
        } else if (viewNe.x - sw.x < limit) {
            dx = limit - (viewNe.x - sw.x);
        }
        if (dx || dy) {
            console.log("dx " + dx + " dy " + dy);
        }
		return this.panBy(new L.Point(dx, dy, true));
    }

    cilogiBase.Popup = L.Popup.extend({
        _initLayout: function () {
            var prefix = 'leaflet-popup',
                container = this._container = L.DomUtil.create('div', prefix + ' ' + this.options.className),
                closeButton;

            if (this.options.closeButton) {
                closeButton = this._closeButton = L.DomUtil.create('a', prefix + '-close-button', container);
                closeButton.href = '#close';

                //L.DomEvent.addListener(closeButton, 'click', this._onCloseButtonClick, this);
                L.DomEvent.addListener(closeButton, pointerUp, this._onCloseButtonClick, this);
            }

            var wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper', container);
            L.DomEvent.disableClickPropagation(wrapper);
            if (this._backgroundColor) {
                wrapper.style.backgroundColor = this._backgroundColor;
            }
            //wrapper.style.opacity = 0.9;

            this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper);
            L.DomEvent.addListener(this._contentNode, 'mousewheel', L.DomEvent.stopPropagation);

            //this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container', container);
            //this._tip = L.DomUtil.create('div', prefix + '-tip', this._tipContainer);
        },
        onAdd : function(map) {
            var that = this;
            L.Popup.prototype.onAdd.apply(this, arguments);
            var close = $(this._contentNode).find(".close");
            // close popup on pointer up
            close.bind(pointerDown, function(e) {
                that._close();
                e.preventDefault();
            });
        },
        setBackground : function(color) {
            this._backgroundColor = color;
            if (this._wrapper && color) {
                this._wrapper.style.backgroundColor = color;
            }
            return this;
        }
    });

    cilogiBase.Marker = L.Marker.extend({
        options: {
            fontIconSize: "100%",
            id: -1
        },
        initialize: function (latlng, options) {
            L.Marker.prototype.initialize.call(this, latlng, options);
            var opt = L.Util.extend({}, {
                fontIconColor: 'black', fontIconName : 'map_pin_alt', fontIconSize : '100%'
            }, options);
            this.options.icon =  new cilogiBase.BubbleIcon(opt);
            this.on(pointerDown, function() { this._tmpOpacity(); }, this);
            this.isReadyPop = false;
        },
        _tmpOpacity : function() {
            var icon = $(this._icon);
            icon.css({opacity: 0.6});
            icon.animate({opacity: 1}, 2000);
        },
        setFeatureOptions : function(options) {
            var opt = L.Util.extend({}, this.options.icon.options, options);
            this.options.icon =  new cilogiBase.BubbleIcon(options);
        },
        _initIcon : function() {
            L.Marker.prototype._initIcon.apply(this, arguments);
            $(this._icon).addClass("cilogiMarker");

            //L.DomEvent.removeListener(this._icon, pointerDown, this._fireMouseEvent);
            if (false && L.Browser.touch) {
                L.DomEvent.addListener(this._icon, "touch", this._fireMouseEvent, this);
                L.DomEvent.addListener(this._icon, "touchstart", this._fireMouseEvent, this);
                L.DomEvent.addListener(this._icon, "touchdown", this._fireMouseEvent, this);
                L.DomEvent.addListener(this._icon, "touchup", this._fireMouseEvent, this);
            }

            L.DomEvent.removeListener(this._icon, pointerUp, this._fireMouseEvent);
            L.DomEvent.addListener(this._icon,  pointerUp, this._fireMouseEvent, this);
            L.DomEvent.removeListener(this._icon, pointerDown, this._fireMouseEvent);
            L.DomEvent.addListener(this._icon,  pointerDown, this._fireMouseEvent, this);
            //L.DomEvent.addListener(this._icon,  pointerOut, this._fireMouseEvent, this);

            //L.DomEvent.addListener(this._icon, pointerOut, this._cancel, this);
        },
        bindPopup: function (content, options) {
            //console.log("My popup binding");
            var anchor = this.options.icon.options.popupAnchor || new L.Point(0, 0);
            if (options && options.offset) {
                anchor = anchor.add(options.offset);
            }

            options = L.Util.extend({offset: anchor}, options);

            if (!this._popup) {
                this.on(pointerDown, function() {
                    this.isReadyPop = true;
                }, this);
                this.on(pointerUp, function() {
                    if (this.isReadyPop) {
                        this.openPopup();
                        this.isReadyPop = false;
                    }
                },this);
                this.on(pointerOut, function() {
                    this.isReadyPop = false;
                }, this);
            }

            this._popup = new cilogiBase.Popup(options, this)
                .setBackground(options.background)
                .setContent(content);

            return this;
        },
        selectIfId : function(id) {
            this.select(id === this.options.id);
        },
        select: function(bool) {
            this.setOpacity(bool ? 1 : 0.2);
            if (bool && this._map) {
                var zoom = this._map.getZoom();
                this._map.setView(this._latlng, zoom);
            }
        },
        setFontSize: function(val) {
            //console.log("set fontsize to " + val + " for " + this._leaflet_id);
            if (this._icon) {
                this._removeIcon();
            }
            this.options.icon.setFontSize(val);
            if (this._map && this._map._panes) {
                this._initIcon();
                this.update();
            }
            //this._reset();
            //console.log("done for " + this._leaflet_id);
        },
        _fireMouseEvent: function (e) {
            //log("firing " + e.type + " on " + e.target + "/" + e.relatedTarget);
            this.fire(e.type, {
                originalEvent: e
            });
            L.DomEvent.stopPropagation(e);
            //if (e.type !== pointerDown && e.type !== pointerUp) {
                //console.log("stopping propogation on " + e.type);
                //L.DomEvent.stopPropagation(e);
            //}
        }
    });

    // A Cilogi layer group contains a bunch of Cilogi markers.
    cilogiBase.LayerGroup = L.LayerGroup.extend({
        select : function(id) {
            var that = this;
            for (layerID in this._layers) {
                var marker = this._layers[layerID];
                marker.select((marker.id === id) ? true : false);
            }
            var markers = $(".cilogiMarker");
            markers.animate({opacity: 1}, {
                duration: 10000,
                complete: function() {
                    for (layerID in that._layers) {
                        var marker = that._layers[layerID];
                        marker.setOpacity(1);
                    }
                }
            });
        }
    });

    cilogiBase.panInsideBounds = pan;

    cilogiBase.ImageMap = L.Map.extend({
        options : {
            worldCopyJump : false,
            closePopupOnClick: true,
            isImage: true,
            attributionControl: false
            //,zoomControl: false
        },
        worldCopyJump : false,
        continuousWorld :  true,
        initialize : function(id, options) {
            this._id = id;
            L.Map.prototype.initialize.call(this, id, options);
            if (this.options.isImage) {
                this.options.crs = new cilogiBase.CRS.CilogiSimple({tileSize : options.tileSize || 256});
                this.options.minZoom = 0;
                this.options.maxZoom = cilogiBase.maxLevel(options.width, options.height);
                //this.options.maxBounds = cilogiBase.bounds(options.width, options.height);
            } else {
                this.options.crs = new cilogiBase.CRS.EPSG3857({tileSize: options.tileSize || 256});
            }
        },
        panInsideBounds : cilogiBase.panInsideBounds,
        resizeMapContainer : function(page) {
            var resize = function() {
                var content, contentHeight, footer, header, viewportHeight;

                window.scrollTo(0, 0);
                header = $(":jqmData(role='header'):visible");
                footer = $(":jqmData(role='footer'):visible");
                content = $(":jqmData(role='content'):visible");
                viewportHeight = $(window).height();
                //log("window height: " + viewportHeight + " header " + header.outerHeight() + " footer "
                    //+ footer.outerHeight() + " address bar " + addressBarHeight());
                contentHeight = viewportHeight - header.outerHeight() - footer.outerHeight() + addressBarHeight();
                $("article:jqmData(role='content')").first().height(contentHeight);
                //console.log("resize map container, height: " + contentHeight);
                $("#"+this._id).height(contentHeight);
                this.invalidateSize();
            };
            page.on('orientationchange pageshow resize', L.Util.bind(resize, this));
        },
        _initLayout: function() {
            L.Map.prototype._initLayout.call(this);
		    if (this._initControlPos) {
                var elTop = L.DomUtil.create('div', "leaflet-top leaflet-center", this._controlContainer);
                this._controlCorners["topcenter"] = elTop;
                var elBot = L.DomUtil.create('div', "leaflet-bottom leaflet-center", this._controlContainer);
                this._controlCorners["bottomcenter"] = elBot;
            }
        }
    });

    L.Map.Drag._onPreDrag = function(f){};
    L.Marker.prototype.options.icon.options.popupAnchor = new L.Point(0,0);

})(cilogi.L, cilogi.log);