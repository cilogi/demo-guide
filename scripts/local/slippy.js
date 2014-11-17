(function ($, log, getQueryArgument) {

    var imageInfoMap = null;  // gets loaded via Ajax first time its needed

    function get(baseURI, attr) {
        return getQueryArgument(baseURI, attr);
    }

    function upperPower2(dimension) {
        return Math.pow(2.0, Math.ceil(Math.log(dimension) / Math.log(2.0)));
    }

    function size(width, height) {
        var max = (width < height) ? height : width;
        return upperPower2(max);
    }

    function loc(x, y, width, height) {
        var sz = size(width, height),
                xo = (sz - width) / 2,
                yo = (sz - height) / 2,
                x = (x + xo) / sz,
                y = (y + yo) / sz;
        return [y, x];
    }

    function addPopup(layer, prop) {
        try {
            //log("featureparse");
            //myLog("featureparse " + geoJSON);
            if (prop) {
                if (prop.options && layer.setFeatureOptions) {
                    layer.setFeatureOptions(prop.options);
                }
                if (prop.popup) {
                    //log("    with property");
                    prop.popup.root = $.mobile.path.parseUrl(cilogi.root).pathname;
                    var popupContent = cilogi.templates.renderMustache("popup", prop.popup);
                    layer.bindPopup(popupContent, {closeButton: false, background: prop.popup.color});
                    layer._popup.on('contentupdate', function () {
                        linkHandler.apply(layer._popup);
                    });
                }
                if (prop.style) {
                    layer.setStyle(prop.style);
                }
                if (prop.id) {
                    layer.options.id = prop.id;
                }
            }
        } catch (err) {
            myLog("exception " + e.message);
        }
    }

    function linkHandler() {
        var elt = $(this._contentNode).find("a");
        elt.on("click", function (e) {
            var target = e.target;
            e.preventDefault();
            $.mobile.changePage($(target).attr("href"));
            return false;
        });
    }

    $(document).on('pageinit', "#image-page", function (e) {
        var root = cilogi.rootPath,
                that = this,
                imageInfoJSON = cilogi.sitePrefix + "db/imageInfo.json";

        if (imageInfoMap) {
            pageInitFunction.call(that, imageInfoMap, e);
        } else {
            $.getJSON(imageInfoJSON, function (data) {
                imageInfoMap = data;
                pageInitFunction.call(that, imageInfoMap, e);
            });
        }
    });

    function htmlDecode(input) {
        var e = document.createElement('div');
        e.innerHTML = input;
        return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
    }

    function pageInitFunction(imageInfoMap, e) {
        var that = this,
                imagePath = get(that.baseURI, "image"),
                alt = get(that.baseURI, "alt"),
                imageInfo = imageInfoMap[imagePath],
                imageMap,
                directUrl,
                imageTile,
                prop,
                tileLoaded = false;

        if (alt) {
            $(that).find("h1").text(htmlDecode(alt));
        }

        $(that).on("vclick touch", "#popup", function (e) {
            e.preventDefault();
            var tgt = e.target;
            $.mobile.changePage(tgt.data - href);
            return false;
        });


        imageMap = new cilogi.L.ImageMap('slippy-image', {
            width: imageInfo.w,
            height: imageInfo.h
        }).setView(new L.LatLng(0.5, 0.5), 0);

        directUrl = 'http://cilogioverlay.appspot.com/i/' + cilogi.host + cilogi.sitePrefix + imagePath + '/{z}_{x}_{y}.jpg';

        imageTile = new L.TileLayer(directUrl, {
            noWrap: true,
            unloadInvisibleTiles: false,
            updateWhenIdle: false
        });
        imageMap.addLayer(imageTile);

        if (imageInfo.markers) {
            prop = {
                "popup": {
                    "title": "Oaks.",
                    "text": "Oak trees are tall",
                    "linkUrl": "wiki/Oak",
                    "color": "green",
                    "theme": "Botanics Trail"
                },
                "options": {
                    "fontIconName": "star",
                    "fontIconColor": "green"
                }
            };
            for (var i = 0; i < imageInfo.markers.length; i++) {
                var markerInfo = imageInfo.markers[i],
                        marker = new cilogi.L.Marker(loc(markerInfo.x, markerInfo.y, imageInfo.w, imageInfo.h), {
                            fontIconName: 'star',
                            fontIconColor: 'red',
                            fontIconSize: 0.6,
                            altThresh: 0.5
                        }),
                        properties = {
                            "popup": {
                                "title": markerInfo.title,
                                "text": markerInfo.description,
                                "linkUrl": markerInfo.url,
                                "color": "green",
                                "theme": markerInfo.title
                            },
                            "options": {
                                "fontIconName": "star",
                                "fontIconColor": "green"
                            }
                        };

                marker.addTo(imageMap);
                addPopup(marker, properties);
            }
        }


        var page = document.getElementById('page'),
                ua = navigator.userAgent,
                iPhone = ~ua.indexOf('iPhone') || ~ua.indexOf('iPod'),
                iPad = ~ua.indexOf('iPad'), // on ipad is all ok
                ios = iPhone,
        // Detect if this is running as a fullscreen app from the homescreen
                fullScreen = window.navigator.standalone,
                android = ~ua.indexOf('Android');

        function addressBarHeight() {
            return ios ? 60 : 0;
        }

        imageMap.resizeMapContainer = function (page) {
            var resize = function () {
                var content, contentHeight, footer, header, viewportHeight;

                window.scrollTo(0, 0);
                header = $(":jqmData(role='header'):visible");
                footer = $(":jqmData(role='footer'):visible");
                content = $(":jqmData(role='content'):visible");
                viewportHeight = $(window).height();
                contentHeight = viewportHeight - header.outerHeight() - footer.outerHeight() + addressBarHeight();
                content.first().height(contentHeight);
                //$("#"+this._id).height($(window).height());
                this.invalidateSize(false);
                imageMap._boundsMinZoom = 0;
                log("resize done, vp: " + viewportHeight + ", ab: " + addressBarHeight() +
                        "hdr: " + header.outerHeight() + ", con: " + contentHeight);
            };
            page.on('orientationchange pageshow resize', L.Util.bind(resize, this));
        };

        imageTile.on("tileload", function (e) {
            if (!tileLoaded) {
                log("Tile is loaded into tile layer");
                $.mobile.loading("hide");
                tileLoaded = true;
            }
        });

        function onPageShow(jqObject) {
            if (!imageMap._initialized4jqm) {
                //log("not inited");
                imageMap.resizeMapContainer(jqObject);
                //imageMap.setView(new L.LatLng(0.5, 0.5), 1);
                imageMap._resetView(new L.LatLng(0.5, 0.5), 1);
                imageMap._initialized4jqm = true;
            }
            // Indicate when loading starts, as appspot can be slow to start up
            if (!tileLoaded) {
                $.mobile.loading("show", {text: "loading image"});
            }
        }

        $(this).bind("pageshow", function () {
            onPageShow($(this));
        });

        onPageShow($("#image-page"));

    };
})(jQuery, cilogi.log, cilogi.fn.getQueryArgument);