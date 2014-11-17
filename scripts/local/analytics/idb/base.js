/* Copyright (c) 2014 Tim Niblett All Rights Reserved.

 File:        base.java  (05/08/14)
 Author:      tim

 Copyright in the whole and every part of this source file belongs to
 Tim Niblett (the Author) and may not be used, sold, licenced, transferred, 
 copied or reproduced in whole or in part in any manner or form or in 
 or on any media to any person other than in accordance with the terms of 
 The Author's agreement or otherwise without the prior written consent of
 The Author.
 */

var Cilogi = Cilogi || {};

(function(Cilogi) {
    "use strict";

    var breaker = {};

    function keys(obj) {
        if (!(obj === Object(obj))) {
            return [];
        }
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    };

    function each(obj, iterator, context) {
        var nativeForEach = Array.prototype.forEach;
        if (obj == null) {
            return obj;
        }
        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            for (var i = 0, length = obj.length; i < length; i++) {
                if (iterator.call(context, obj[i], i, obj) === breaker) return;
            }
        } else {
            var keys = keys(obj);
            for (var i = 0, length = keys.length; i < length; i++) {
                if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
            }
        }
        return obj;
    };

   function extend(obj) {
        var key,
            // An array of all the arguments except the first
            array = Array.prototype.slice.call(arguments, 1);
        each(array, function (arg) {
            if (arg) {
                for (key in arg) {
                    obj[key] = arg[key];
                }
            }
        });
        return obj;
    };

    // This only works in the browser, but it is the simplest
    // way to parse a URL. Node has its own function if you're on the server.
    function parseURL(url) {
        var parser = document.createElement('a'),
            searchBase,
            searchParameters = {},
            queries, split, i;
            parser.href = url;

        searchBase = parser.search.replace(/^\?/,'');
        queries = searchBase.split('&');
        for( i = 0; i < queries.length; i++ ) {
            split = queries[i].split('=');
            searchParameters[split[0]] = split[1];
        }
        return {
            protocol: parser.protocol,
            host: parser.host,
            hostname: parser.hostname,
            port: parser.port,
            pathname: parser.pathname,
            search: searchBase,
            searchParameters: searchParameters,
            hash: parser.hash
        };
    }

    function log() {
        if((typeof console !== 'undefined')) {
            console.log(Array.prototype.slice.call(arguments, 0));
        }
    }


    Cilogi.keys = keys;
    Cilogi.each = each;
    Cilogi.extend = extend;
    Cilogi.parseURL = parseURL;
    Cilogi.log = log;

})(Cilogi);



