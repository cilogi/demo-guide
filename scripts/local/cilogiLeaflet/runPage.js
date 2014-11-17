// Copyright (c) 2012 Tim Niblett All Rights Reserved.
//
// File:        cilogiLeafletRun.js  (09/05/12)
// Author:      tim
// $
//
// Copyright in the whole and every part of this source file belongs to
// Tim Niblett (the Author) and may not be used, sold, licenced, transferred,
// copied or reproduced in whole or in part in any manner or form or in
// or on any media to any person other than in accordance with the terms of
// The Author's agreement or otherwise without the prior written consent of
// The Author.
//

(function ($, cilogi) {
    $.fn.cilogiMap = function (page, spec, options) {
        var opt = $.extend({
                logging: true,
                defaultTileSize: 512,
                defaultMaxZoom: 17,
                defaultMinZoom: 14
            }, options || {});

        function log(a) {
            if(opt.logging && (typeof console !== 'undefined')) {
                console.log(Array.prototype.slice.call(arguments, 0));
            }
        }

        function myLog(s) {
            //$("#log").append("<p>"+s+"</p>");
        }

        return this.each(function () {
            var map, geo, mapElement;

            function init() {
                geo = initGeoJson(spec);
                initMap(spec, geo);
            }

            function eachFeature(geoJSON, layer) {
                try {
                    //log("featureparse");
                    //myLog("featureparse " + geoJSON);
                    var prop = geoJSON.properties;
                    if (prop) {
                        if (prop.options && layer.setFeatureOptions) {
                            layer.setFeatureOptions(prop.options);
                        }
                        if (prop.popup) {
                            //log("    with property");
                            prop.popup.root = cilogi.sitePrefix;
                            var popupContent = cilogi.templates.renderMustache("popup", prop.popup);
                            layer.bindPopup(popupContent, {closeButton:false, background: prop.popup.color});
                            layer._popup.on('contentupdate', function() {
                                linkHandler.apply(layer._popup);
                            });
                        }
                        if (prop.link) {
                            layer.on("click touch", function() {
                                $.mobile.changePage(prop.link, {transition: "slide"});
                            });
                        }
                        if (prop.style) {
                            layer.setStyle(prop.style);
                        }
                        if (prop.id) {
                            layer.options.id = prop.id;
                        }
                    }
                }  catch (err) {
                    myLog("exception " + e.message);
                }
            }

            function linkHandler() {
                var elt = $(this._contentNode).find("a"),
                          that = this;
                elt.on("click touch", function(e) {
                    var target = e.target;
                    e.preventDefault();
                    that._close();
                    $.mobile.changePage($(target).attr("href"));
                    return false;
                });
            }

            function initGeoJson(spec) {
                var geoJSON = new cilogi.L.GeoJSON(null, {
                    pointToLayer: function (geojson, latlng){
                        var prop = geojson.properties;
                        return new cilogi.L.Marker(latlng, prop.options || {});
                    },
                    onEachFeature: eachFeature
                });

                geoJSON.addData(spec);
                return geoJSON;
            }

            function initMap(spec, geoJson) {
                var isImage = !!spec.params.isImage,
                    theTileSize = spec.params.tileSize || opt.tileSize,
                    name = spec.params.name || 'map',
                    imageType = spec.params.imageType || "png",
                    mapUrl = spec.params.tile ? spec.params.tile : cilogi.sitePrefix + "diagrams/" + spec.params.root + "img_{x}_{y}_{z}." + imageType,
                    mapAttribution = spec.params.attribution || "",
                    max = spec.params.zoom.max || opt.defaultMaxZoom,
                    min = (typeof spec.params.zoom.min == 'undefined') ? opt.defaultMinZoom : spec.params.zoom.min,
                    tileLayer = new L.TileLayer(mapUrl, {
                        tileSize: theTileSize,
                        maxZoom: max,
                        minZoom: min,
                        noWrap: true,
                        attribution: mapAttribution
                    }),
                    sizes = spec.params.sizes;

                log("max zoom " + spec.params.zoom.max);
                log("max default " + opt.defaultMaxZoom);
                log("combined " + (spec.params.zoom.max || opt.defaultMaxZoom));

                map = new cilogi.L.ImageMap(name, {
                        width: spec.params.width,
                        height: spec.params.height,
                        tileSize: theTileSize,
                        isImage: isImage,
                        crs: new cilogi.L.CRS.EPSG3857()
                      });

                map.addLayer(tileLayer);
                map.addLayer(geoJson);
                map.on("viewreset", function() {
                    var zoom = map.getZoom();
                    var size = sizes[zoom] || 1.0;
                    log("resize, zoom " + zoom + " size " + size);
                    for (var layerID in map._layers) {
                        var layer = map._layers[layerID];
                        if (layer instanceof L.LayerGroup) {
                          layer.invoke("setFontSize", size);
                        }
                    }
                    window.scrollTo(0, 1);
                });
                // set up links to next, previous, and home so we can add in buttons as needed
                /*
                if (spec.params.next) {
                    var nextButton = new cilogi.L.Button({
                        position: 'bottomright',
                        url: spec.params.next ,
		                name: 'arrow_right',
                    });
                    map.addControl(nextButton);
                }
                if (spec.params.prev) {
                    var prevButton = new cilogi.L.Button({
                        position: 'bottomleft',
                        url: spec.params.prev,
		                name: 'arrow_left',
                    });
                    map.addControl(prevButton);
                }
                if (spec.params.home) {
                    var homeButton = new cilogi.L.Button({
                        url: spec.params.home
                    });
                    map.addControl(homeButton);
                }
                if (true) {
                    var hashButton = new cilogi.L.Button({
                        position: 'topright',
                        name: 'hash keypad-button',
                        url: '#keypad',
                        fn: cilogi.fn.bindPad
                    });
                    map.addControl(hashButton);
                    var zoomButtons = new cilogi.L.Zoom({

                    });
                    map.addControl(zoomButtons);
                }
                */
                if (spec.params.title) {
                    var titleButton = new cilogi.L.Title({
                        position: 'topcenter',
                        title: spec.params.title
                    });
                    map.addControl(titleButton);
                }
            }

            function onPageShow(jqObject) {
                if (!map._initialized4jqm) {
                    //log("not inited");
                    map.resizeMapContainer(jqObject);
                    map.setView(getCenter(), getStartZoom());
                    map._initialized4jqm = true;
                }
            }

            function getCenter() {
                var sc = spec.params.center || [0.5, 0.5];
                return new L.LatLng(sc[0], sc[1]);
            }

            function getStartZoom() {
                var levels = spec.params.zoom;
                return levels.start;
            }

            function onViewReset() {
                var zoom = map.getZoom(),
                    size = spec.params.sizes[zoom] || 1.0,
                    layerID,
                    layer;

                for (layerID in map._layers) {
                    layer = map._layers[layerID];
                    if (layer instanceof L.LayerGroup) {
                        layer.invoke("setFontSize", size);
                    }
                }
            }

            function onPageShowEvent() {
                log("pageshow");
                onPageShow($(this));
                if (cilogi.diagramId != null) {
                    geo.select(cilogi.diagramId);
                    cilogi.diagramId = null;
                }
            }

            page.bind("pageshow", onPageShowEvent);

            init();
            map.resizeMapContainer(page);

            $(this).bind('selectId', function(event, id) {
                if (id) {
                    geo.select(id);
                }
            });


            if (options.pageShown) {
                onPageShowEvent();
            }
            log("init done");
        });
    }
})(jQuery, cilogi);