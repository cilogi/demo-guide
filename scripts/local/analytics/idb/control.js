/*
 Copyright (c) 2014 Tim Niblett All Rights Reserved.

 File:        control.js.java  (08/08/14)
 Author:      tim

 Copyright in the whole and every part of this source file belongs to
 Tim Niblett (the Author) and may not be used, sold, licenced, transferred, 
 copied or reproduced in whole or in part in any manner or form or in 
 or on any media to any person other than in accordance with the terms of 
 The Author's agreement or otherwise without the prior written consent of
 The Author.
 */

(function (Cilogi, Packet, dbFuns, log) {
    "use strict";


    function Control() {
        this.sendingPacket = false;
    }

    Control.prototype.addHit = function (data, options) {

        function addHitSuccess(request) {
            this.sendPacket(options);
        }

        function addHitError(request) {
            window.setTimeout(function () {
                this.addHit(data, options);
            }.bind(this), 50);
        }

        log("Control add hit");
        if (!data) {
            log("  Control add hit no data");
            return;
        } else {
            dbFuns.addHit(data, addHitSuccess.bind(this), addHitError.bind(this))
        }
    }

    Control.prototype.singleHit = function(data, options) {
        var packet = new Packet(this, options);
        packet.singleHit(data);
    }

    Control.prototype.sendPacket = function (options) {
        if (!this.sendingPacket) {
            var packet = new Packet(this, options);
            this.setSendingPacket(true);
            try {
                dbFuns.fillPacket(packet, function () {
                    if (packet.getNHits()) {
                        log("sending packet with keys: " + JSON.stringify(packet.getKeys()));
                        packet.send();
                    } else {
                        this.setSendingPacket(false);
                    }
                }.bind(this));
            } catch (e) {
                log("Error filling packet: " + e.message);
                this.setSendingPacket(false);
            }
        }
    }

    Control.prototype.setSendingPacket = function (bool) {
        this.sendingPacket = bool;
    }

    Control.prototype.markDone = function (keys, callback) {
        dbFuns.markDone(keys, callback);
    }

    Cilogi.Control = Control;

})(Cilogi, Cilogi.Packet, Cilogi.dbFuns, Cilogi.log);
