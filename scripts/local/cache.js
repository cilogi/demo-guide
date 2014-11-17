// Copyright (c) 2011 Tim Niblett All Rights Reserved.
//
// File:        cache.js.java  (16-May-2011)
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

(function(log) {
    var cacheStatusValues = [];
    cacheStatusValues[0] = 'uncached';
    cacheStatusValues[1] = 'idle';
    cacheStatusValues[2] = 'checking';
    cacheStatusValues[3] = 'downloading';
    cacheStatusValues[4] = 'updateready';
    cacheStatusValues[5] = 'obsolete';

    var cache = window.applicationCache;
    cache.addEventListener('cached', logEvent, false);
    cache.addEventListener('checking', logEvent, false);
    cache.addEventListener('downloading', logEvent, false);
    cache.addEventListener('error', logEvent, false);
    cache.addEventListener('noupdate', logEvent, false);
    cache.addEventListener('obsolete', logEvent, false);
    cache.addEventListener('progress', logEvent, false);
    cache.addEventListener('updateready', logEvent, false);

    function logEvent(e) {
        var online, status, type, message;
        online = (navigator.onLine) ? 'yes' : 'no';
        status = cacheStatusValues[cache.status];
        type = e.type;
        message = 'online: ' + online;
        message+= ', event: ' + type;
        message+= ', status: ' + status;

        if (type == 'error' && navigator.onLine) {
            message+= ' (perhaps a syntax error in manifest) ';
        }
        log(message);
        if (type == 'error') {
            var output = '';
            for (property in e) {
                if (e.hasOwnProperty(property)) {
                    log(property + ': ' + e[property]);
                }
            }
            console.log("end of error properties");
        }
    }

    window.applicationCache.addEventListener(
        'updateready',
        function(){
            window.applicationCache.swapCache();
            log('swap cache has been called');
        },
        false
    );

    setInterval(function(){
        try {
            cache.update();
        } catch (e) {}
    }, 180 * 1000);
})(cilogi.log);


