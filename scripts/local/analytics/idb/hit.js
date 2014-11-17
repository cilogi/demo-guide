/* Copyright (c) 2014 Tim Niblett All Rights Reserved.

 File:        hit.js.java  (05/08/14)
 Author:      tim

 Copyright in the whole and every part of this source file belongs to
 Tim Niblett (the Author) and may not be used, sold, licenced, transferred, 
 copied or reproduced in whole or in part in any manner or form or in 
 or on any media to any person other than in accordance with the terms of 
 The Author's agreement or otherwise without the prior written consent of
 The Author.
 */

(function (Cilogi) {
    "use strict";

    var     IS_SENT = "sent",
            IS_UNSENT = "unsent",
            STATUS_SINGLE = "single",
            STATUS_BATCH = "batch",
            uuid = uuid();

    // split a URL query into its arguments and put them in a map (JS object)
    // the query looks like <code>a=b&c=d&...</code>
    function parseQuery(query) {
        var map = {}, vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            map[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }
        return map;
    }

    // Generate a unique ID based on a random number generator
    // the date is there if the random number generator isn't quite up to it by itself
    function uuid() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid;
    };

    function Hit(query) {
        var map;
        this.query = query;
        map = parseQuery(query);
        this.clientId = map.clientId ? map.clientId : uuid;
        this.uuid = uuid;
        this.status = STATUS_BATCH;
        this.sent=Hit.UNSENT;
    };

    Hit.SENT = IS_SENT;
    Hit.UNSENT = IS_UNSENT;

    Hit.prototype.setStatus = function(status) {
        this.status = status;
        return this;
    }

    Hit.prototype.setSent = function(sentValue) {
        this.sent = sentValue;
        return this;
    }


    Hit.prototype.toJSON = function () {
        var obj = {
                "clientId": this.clientId,
                "uuid": this.uuid,
                "query": this.query,
                "created": new Date(),
                "status": this.status,
                "sent": this.sent
            };
        return obj;
    }

    Cilogi.Hit = Hit;
})(Cilogi);