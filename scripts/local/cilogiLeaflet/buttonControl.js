// Copyright (c) 2012 Tim Niblett All Rights Reserved.
//
// File:        control.js  (16/08/12)
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

cilogi.L.Button = L.Control.extend({
    // these options need to be overridden on a regular basis
	options: {
		position: 'bottomcenter',
		name: 'home',
		url: '../index.html',
		fontClass: 'iconic'
	},

	onAdd: function (map) {
		var className = 'leaflet-control-button',
		    container = this._buttonDiv = L.DomUtil.create('div', className),
		    fn = (typeof this.options.fn == 'undefined') ? this._goto : this.options.fn;

		this._createButton('Next', this.options.name + ' ' + this.options.fontClass, container, fn, this);

		return container;
	},

	addTo: function(map) {
	    L.Control.prototype.addTo.call(this, map);
        //log("WIDTH = " + this._buttonDiv.clientWidth)
	},

	_goto: function() {
	    $.mobile.changePage(this.options.url);
	},

	_createButton: function (title, className, container, fn, context) {
		var link = L.DomUtil.create('a', className, container);
		link.href = this.options.url;
		link.title = title;

		L.DomEvent
			.on(link, 'click', L.DomEvent.stopPropagation)
			.on(link, 'click', L.DomEvent.preventDefault)
			.on(link, 'click', fn, context)
			.on(link, 'dblclick', L.DomEvent.stopPropagation);

		return link;
	},
});

})(jQuery, cilogi, cilogi.log);

