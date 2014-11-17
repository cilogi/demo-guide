// Copyright (c) 2012 Tim Niblett All Rights Reserved.
//
// File:        titleControl.js  (18/08/12)
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


cilogi.L.Title = L.Control.extend({
 	options: {
 		position: 'topcenter',
 		title: ''
 	},

 	onAdd: function (map) {
 		this._container = L.DomUtil.create('div', 'leaflet-control-title');
 		L.DomEvent.disableClickPropagation(this._container);

 		this._update();

 		return this._container;
 	},

 	setTitle: function (title) {
 		this.options.title = title;
 		this._update();
 		return this;
 	},

 	_update: function () {
 		if (!this._map) { return; }

 		this._container.innerHTML = this.options.title;
 	}

 });
})(jQuery, cilogi, cilogi.log);