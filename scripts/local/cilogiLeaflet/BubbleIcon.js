// Copyright (c) 2012 Tim Niblett All Rights Reserved.
//
// File:        cilogiLeaflet.java  (19/04/12)
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

(function(cilogiBase) {

    function createCharIcon (anchor, fontIconSize, fontIconFont, fontIconName, fontIconColor) {
        var div = document.createElement('div');
        this._setIconStyles(div, 'icon');
        div.style.position = "absolute";

        var left = (-anchor.x) + 'em';
        var top =  (-anchor.y) + 'em';
        console.log("left " + left + " top " + top);
        div.style.left = left;
        div.style.top  = top;
        div.style.margin = "0";
        div.style.fontSize  = Math.round(fontIconSize * 180) + "%";
        div.className = fontIconFont + " " + fontIconName + " " + fontIconColor;
        this._div = div;
        return div;
    }

    cilogiBase.BubbleIcon = L.Icon.extend({ options: {
            fontIconFont : 'fa',
            fontIconName: 'fa-map-marker',
            fontIconColor: 'blue',
            altThresh: 1.0,
            altIconName: 'fa-map-marker',
            fontIconSize: 1.0,
            computeClass: function() {
                return "bubble " + this.fontIconFont + " " + this.fontIconName + " " + "white";
            },
            anchor: new L.Point(1, 2.5),
        },
        initialize: function () {
            L.Icon.prototype.initialize.apply(this, arguments);
        },
        computeAnchor : function(size) {
            return this.isAlt(size) ? new L.Point(0.25, 1) : new L.Point(1, 2.5);
        },
        isAlt: function(size) {
            return (size < this.options.altThresh)
                || (this.options.fontIconName == this.options.altIconName);
        },
        createIcon: function () {
            if (this.isAlt(this.options.fontIconSize)) {
                this._alt = true;
                var anchor = this.computeAnchor(this.options.fontIconSize);
                return createCharIcon.call(this, this.options.anchor,
                    this.options.fontIconSize, this.options.fontIconFont,
                    this.options.altIconName, this.options.fontIconColor);
            }  else {
                this._alt = false;
                return this.createBubbleIcon();
            }
        },
        createBubbleIcon: function() {
            var anchor = this.computeAnchor(this.options.size);
            var div = document.createElement('div');
            this._setIconStyles(div, 'icon');

            div.className="triangle-isosceles-" + this.options.fontIconColor;

            var subDiv = document.createElement('div');
            subDiv.className = this.options.computeClass();

            div.appendChild(subDiv);

            var span = document.createElement("span");
            span.className = "shine";
            subDiv.appendChild(span);

			div.style.marginLeft = (-anchor.x) + 'em';
			div.style.marginTop  = (-anchor.y) + 'em';
			div.style.fontSize = Math.round(this.options.fontIconSize * 100) + "%";
            this._div = div;
            return div;

        },
        createShadow: function () {
            return null;
        },
        setFontSize: function(size) {
            this.options.fontIconSize = size;
            this.options.anchor = this.computeAnchor(size); // belt and braces
        }
    });

})(cilogi.L);

