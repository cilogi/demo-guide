// Copyright (c) 2012 Tim Niblett All Rights Reserved.
//
// File:        zoomControl.js  (20/08/12)
// Author:      tim
//
// Copyright in the whole and every part of this source file belongs to
// Tim Niblett (the Author) and may not be used, sold, licenced, transferred, 
// copied or reproduced in whole or in part in any manner or form or in 
// or on any media to any person other than in accordance with the terms of 
// The Author's agreement or otherwise without the prior written consent of
// The Author.
//

(function($, cilogi, log) {

cilogi.L = cilogi.L || {};

cilogi.L.Zoom = L.Control.extend({
	options: {
		position: 'topleft',
		fontName: 'iconic',
	},

	onAdd: function (map) {
		var className = 'leaflet-control-cilogiZoom',
		    container = L.DomUtil.create('div', className);

		this._createButton('Zoom in', className + ' plus ' + this.options.fontName, container, map.zoomIn, map);
		this._createButton('Zoom out', className + ' minus ' + this.options.fontName, container, map.zoomOut, map);

		return container;
	},

	_createButton: function (title, className, container, fn, context) {
		var link = L.DomUtil.create('a', className, container);
		link.href = '#';
		link.title = title;

		L.DomEvent
			.on(link, 'click', L.DomEvent.stopPropagation)
			.on(link, 'click', L.DomEvent.preventDefault)
			.on(link, 'click', fn, context)
			.on(link, 'dblclick', L.DomEvent.stopPropagation);

		return link;
	}
});

})(jQuery, cilogi, cilogi.log);
