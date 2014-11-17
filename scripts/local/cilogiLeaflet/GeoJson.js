// Copyright (c) 2012 Tim Niblett All Rights Reserved.
//
// File:        cilogiLeafletGeoJson.js  (14/06/12)
// Author:      tim
//
// Copyright in the whole and every part of this source file belongs to
// Tim Niblett (the Author) and may not be used, sold, licenced, transferred, 
// copied or reproduced in whole or in part in any manner or form or in 
// or on any media to any person other than in accordance with the terms of 
// The Author's agreement or otherwise without the prior written consent of
// The Author.
//

(function(cilogiBase) {
    cilogiBase.GeoJSON = L.GeoJSON.extend({
        select : function(id) {
            var that = this,
                markers = $(".cilogiMarker"),
                selectedMarker = null;

            if (typeof id === 'undefined') {
                return;
            }

            for (layerID in this._layers) {
                var marker = this._layers[layerID],
                    isSelected = marker.options.id == id;

                marker.select(isSelected ? true : false);
                markers.add(marker._icon);
                if (isSelected) {
                    selectedMarker = marker;
                }
            }
            if (selectedMarker !== null && selectedMarker._map) {
                selectedMarker._map.setView(selectedMarker.getLatLng(), selectedMarker._map.getZoom());
            }
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
})(cilogi.L);

