/*
 * Code, which should be embedded on each page div which sets the fixed navbar.
 * The elements to be set are the shop, the tour and the map.
 * The shop button is either a link to the shop, or a link with a different
 * color item to a particular item (or items which can be bought from this page.
 *
 */

var cilogi = window.cilogi || {};

(function($, cilogi, _) {
    var tourId = "#tour-nav",
        shopId = "#shop-nav",
        mapId  = "#map-nav",
        names = [tourId, shopId, mapId],
        allIcons = ["shop", "shop-red", "navigation",
            "carat-u", "carat-l", "carat-r", "back", "home"],
        defaults = {
            "#shop-nav": {enabled: true,  url: null, icon: "shop",       text: "Shop", id: -1, dataRel: null},
            "#tour-nav": {enabled: false, url: null, icon: "carat-u",    text: "Tour", id: -1, dataRel: null},
            "#map-nav":  {enabled: false, url: null, icon: "navigation", text: "Map",  id: -1, dataRel: null}
        },
        navbarMap = {};


    function clearIcon(elt) {
        for (var i = 0; i < allIcons.length; i++) {
            elt.removeClass("ui-icon-" + allIcons[i]);
        }
        elt.removeAttr("data-icon");
    }

    function changeIcon(elt, icon) {
        clearIcon(elt);
        elt.addClass("ui-icon-"+icon);
        elt.attr("data-icon", icon);
    }

    function update(eltName, map) {
        var deflt = defaults[eltName],
            opts = _.extend({}, deflt, map),
            elt = $(eltName);

        if (opts.enabled) {
            elt.css("opacity", 1);
            elt.removeClass("ui-disabled");
        } else {
            elt.css("opacity", 0.5);
            elt.addClass("ui-disabled");
        }
        elt.attr("href", opts.url ? opts.url : "#");
        elt.text(opts.text);
        elt.attr("data-id", opts.id);
        if (opts.dataRel) {
            elt.attr("data-rel", opts.dataRel);
        } else {
            elt.removeAttr("data-rel");
        }
        changeIcon(elt, opts.icon);
    }

    function doUpdateNav(map) {
        var i, name;
        for (i = 0; i < names.length; i++) {
            name = names[i];
            update(name, map[name]);
        }
        //doStore(map.storeUrl);
        //doTour(map.tourUrl, map.tourText, map.tourIcon);
        //doMap(map.mapUrl, map.mapId, map.mapText, map.mapIcon);
    }

    function setMap(loc, map) {
        navbarMap[loc] = map;
    }

    function getMap(loc) {
        return navbarMap[loc];
    }

    function updateNav(loc) {
        var map = getMap(loc);
        if (map) {
            doUpdateNav(map);
        }
    }

    function historyLength() {
        return window.history.length - 1;
    }


    cilogi.nav = {
        historyLength: historyLength,
        setMap : setMap,
        update: updateNav
    };


})(jQuery, cilogi, _);
