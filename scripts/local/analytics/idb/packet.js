/* Copyright (c) 2014 Tim Niblett All Rights Reserved.

 File:        packet.js.java  (04/08/14)
 Author:      tim

 Copyright in the whole and every part of this source file belongs to
 Tim Niblett (the Author) and may not be used, sold, licenced, transferred, 
 copied or reproduced in whole or in part in any manner or form or in 
 or on any media to any person other than in accordance with the terms of 
 The Author's agreement or otherwise without the prior written consent of
 The Author.
 */

(function (Cilogi, Hit, log) {
    "use strict";

    var     DEFAULT_TIMEOUT_MS = 5000,
            DEFAULT_DELAY_MS = 100,
            MAX_DELAY_MS = 25600,
            MAX_HITS = 10,

            BATCH_HIT_URL = "/control/batch",
            SINGLE_HIT_URL = "/control/single";

    // MaxHits 1 if we want to see how well a direct send to GA or other service
    // would do
    function Packet(controller, options) {
        this.options = Cilogi.extend({}, {maxHits: MAX_HITS, host: ""}, options);
        this.controller = controller;
        this.hits = [];
        this.keys = [];
        this.delay = DEFAULT_DELAY_MS;
        this.nHits = 0;

        this.singleHitUrl = SINGLE_HIT_URL;
        this.batchHitUrl = BATCH_HIT_URL;
        this.timeoutId = 0;
    }

    Packet.prototype.singleHit = function (data) {
        var hit = new Hit(data).setStatus("single"),
            url = this.options.host + this.singleHitUrl,
            msg = JSON.stringify([hit]);
        log("single hit with URL " + url);
        $.ajax(url, {
            type: "POST",
            data: msg,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            xhrFields: {
               withCredentials: true
            },
            timeout: DEFAULT_TIMEOUT_MS
        }).fail(function (_, status, error) {
                    log("Single HIT FAIL, status: " + status + ", error: " + error);
                });
    }

    Packet.prototype.toJSON = function () {
        return {
            hits: this.hits
        }
    }

    Packet.prototype.addHit = function (hitData, key) {
        log("AddHit, data is " + hitData);
        if (hitData && !this.isFull()) {
            this.hits.push(new Hit(hitData));
            this.nHits++;
            this.keys.push(key);
            return true
        } else {
            return false;
        }
    }

    Packet.prototype.isFull = function () {
        return this.nHits >= this.options.maxHits;
    }

    Packet.prototype.getKeys = function () {
        return this.keys;
    }

    Packet.prototype.getNHits = function () {
        return this.nHits;
    }

    Packet.prototype.getDelay = function () {
        return this.delay;
    }

    Packet.prototype.adjustDelayOnFailure = function () {
        if (this.delay < MAX_DELAY_MS) {
            this.delay *= 2;
        }
    }

    Packet.prototype.setStatus = function(hits, status) {
        Cilogi.each(hits, function(hit) { hit.setStatus(status);})
        return hits
    }

    Packet.prototype.send = function () {
        var jsonData;

        if (this.getNHits() > 0) {
            if (this.timeoutId) {
                this.timeoutId = 0;
                window.clearTimeout(this.timeoutId);
            }
            //this.delay = DEFAULT_DELAY_MS;
            jsonData = JSON.stringify(this.setStatus(this.hits, "batch"));
            $.ajax(this.options.host + this.batchHitUrl, {
                type: "POST",
                data: jsonData,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                xhrFields: {
                    withCredentials: true
                },
                timeout: DEFAULT_TIMEOUT_MS
            }).done(function () {
                        this.controller.markDone(this.getKeys(), function () {
                            this.controller.setSendingPacket(false);
                            this.controller.sendPacket(this.options);
                        }.bind(this));
                    }.bind(this))
            .fail(function () {
                this.adjustDelayOnFailure();
                this.sendWithDelay();
            }.bind(this));
        }
    }

    Packet.prototype.sendWithDelay = function () {
        Cilogi.log("delaying call by " + this.delay + "ms on failure");
        this.timeoutId = window.setTimeout(function () {
            this.send();
        }.bind(this), this.delay);
    }

    Cilogi.Packet = Packet;
})(Cilogi, Cilogi.Hit, Cilogi.log);
