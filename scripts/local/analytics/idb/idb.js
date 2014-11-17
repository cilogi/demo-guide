/* Copyright (c) 2014 Tim Niblett All Rights Reserved.

 File:        idb.js.java  (08/08/14)
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

    var DB_NAME = "hitDB",
        DB_STORE = "hits",
        INDEX_FIELD = "sent",

            // all interaction with the database goes through these fields, so that
            // we can use the shim.
        indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB,
        IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction,
        IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange,
        IDBDatabase = window.IDBDatabase || window.webkitIDBDatabase || window.msIDBDatabase,
        IDBCursor = window.IDBCursor || window.webkitIDBCursor || window.msIDBCursor,

        db = null,
        dbLoading = true; // needed as db loading is async

    setReplacements();
    function setReplacements() {
        if (window.shimIndexedDB) {
            var replace = window.shimIndexedDB.__replacements();

            indexedDB = replace.indexedDB;
            IDBTransaction = replace.IDBTransaction;
            IDBKeyRange = replace.IDBKeyRange;
            IDBDatabase = replace.IDBDatabase;
            IDBCursor = replace.IDBCursor;
        }
    }

    function initDB() {
        var request = indexedDB.open(DB_NAME, 1);

        request.onsuccess = function () {
            db = request.result;
            dbLoading = false;
        };

        request.onerror = function () {
            log("IndexedDB error: " + request.errorCode);
            dbLoading = false;
        };

        request.onupgradeneeded = function () {
            var objectStore = request.result.createObjectStore(
                    "hits", {autoIncrement: true });

            objectStore.createIndex(INDEX_FIELD, INDEX_FIELD, {unique: false});
        };
    }

    // the basic act of adding a hit.  Its possible that the database is loading
    // when we get the first hit, so we return false then.
    function addHit(hitData, onSuccess, onError) {
        var hit = new Hit(hitData),
                json = hit.toJSON();

        if (db) {
            var transaction = db.transaction(DB_STORE, "readwrite"),
                store = transaction.objectStore(DB_STORE),
                text = JSON.stringify(json);
            log("  addHit, adding " + text);
            var request = store.add(json);
            request.onsuccess = function(e) {
                log("  addHit succeeded for " + text);
                if (onSuccess) {
                    onSuccess(request);
                }
            }
            request.onerror = function(e) {
                log("  addHit failed: " + request.error.name + " for data " + text);
                if (onError) {
                    onError(request);
                }
            }
            return true;
        } else {
            if (dbLoading) {
                window.setTimeout(function () {
                    log("50ms timeout waiting for database to initialize");
                    addHit(hitData, onSuccess, onError);
                }, 50);
            } else {
                return false;
            }
        }
    }

    // the basic act of marking a bunch of hits as done
    function markDone(keyIndices, callback) {
        if (db) {
            var i, count, key, value, request, response,
                transaction = db.transaction(DB_STORE, "readwrite"),
                store = transaction.objectStore(DB_STORE);
            count = keyIndices.length;
            markKeyDone(store, count, keyIndices, callback);
        }
    }

    function markKeyDone(store, count, keys, callback) {
        if (count <= 0) {
            callback();
        } else {
            var key = keys[count-1],
                request = store.get(key),
                response;
            request.onsuccess = function() {
                var value = request.result;
                if (value) {
                    value[INDEX_FIELD] = Hit.SENT;
                    response = store.put(value, key);
                    response.onsuccess = function () {
                        markKeyDone(store, count-1, keys, callback);
                    }
                } else {
                    log("Warning: There is no value for " + key);
                    markKeyDone(store, count-1, keys, callback);
                }
             }
            request.onerror = function() {
                log("Can't update hit with key: " + key + ", aborting");
            }
        }
    }

    // fill a packet with data
    function fillPacket(packet, callback) {
        if (db) {
            var transaction = db.transaction(DB_STORE, "readwrite"),
                    store = transaction.objectStore(DB_STORE),
                    storeIndex = store.index(INDEX_FIELD),
                    range = IDBKeyRange.only(Hit.UNSENT),
                    request = storeIndex.openCursor(range);

            request.onsuccess = function (e) {
                var cursor = e.target.result;
                if (cursor) {
                    if (cursor.value.query) {
                        if (!packet.addHit(cursor.value.query, cursor.primaryKey)) {
                            // should be when packet is full
                            callback();
                            return;
                        }
                    } else {
                        cursor.delete();
                    }
                    cursor.continue();
                } else {
                    log("No more entries! Queue is empty: " + packet.getNHits());
                    callback();
                }
            };
            request.onerror = function(e) {
                packet.controller.setSendingPacket(false);
                log("Error getting cursor: " + e.message);
            }
        } else {
            window.setTimeout(function () {
                log("50ms timeout waiting for database to initialize");
                fillPacket(packet, callback);
            }, 50);
        }

    }


    Cilogi.dbFuns = {
        addHit: addHit,
        markDone: markDone,
        fillPacket: fillPacket,
        index: "sent"
    }

    initDB();

})(Cilogi, Cilogi.Hit, Cilogi.log);
