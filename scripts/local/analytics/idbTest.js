/* Copyright (c) 2014 Tim Niblett All Rights Reserved.

 File:        idbTest.java  (07/08/14)
 Author:      tim

 Copyright in the whole and every part of this source file belongs to
 Tim Niblett (the Author) and may not be used, sold, licenced, transferred, 
 copied or reproduced in whole or in part in any manner or form or in 
 or on any media to any person other than in accordance with the terms of 
 The Author's agreement or otherwise without the prior written consent of
 The Author.
 */

(function () {
    var indexedDB = window.indexedDB,
            IDBTransaction = window.IDBTransaction,

            db, hits = [
                { id: 1, uuid: "abcdef", clientId: "12345", params: "a=b&c=d", done: true },
                { id: 2, uuid: "abcdef", clientId: "12345", params: "a=b&c=d", done: true },
                { id: 3, uuid: "abcdef", clientId: "12345", params: "a=b&c=d", done: true },
                { id: 4, uuid: "abcdef", clientId: "12345", params: "a=b&c=d", done: true },
                { id: 5, uuid: "abcdef", clientId: "12345", params: "a=b&c=d", done: false },
                { id: 6, uuid: "abcdef", clientId: "12345", params: "a=b&c=d", done: false },
                { id: 7, uuid: "abcdef", clientId: "12345", params: "a=b&c=d", done: false },
                { id: 8, uuid: "abcdef", clientId: "12345", params: "a=b&c=d", done: false },
                { id: 9, uuid: "abcdef", clientId: "12345", params: "a=b&c=d", done: false },
                { id: 10, uuid: "abcdef", clientId: "12345", params: "a=b&c=d", done: false }
            ];

    function initDb() {
        var request = indexedDB.open("testDB", 1);
        request.onsuccess = function (evt) {
            db = request.result;
            print();
        };

        request.onerror = function (evt) {
            console.log("IndexedDB error: " + evt.target.errorCode);
        };

        request.onupgradeneeded = function (evt) {
            var objectStore = evt.currentTarget.result.createObjectStore(
                    "hits", { keyPath: "key", autoIncrement: true });

            objectStore.createIndex("batchStatus", "batchStatus", { unique: false });

            for (var i = 0; i < hits.length; i++) {
                objectStore.add(hits[i]);
            }
        };
    }

    function print() {
        var transaction = db.transaction("hits", "readwrite"),
                objectStore = transaction.objectStore("hits"),
                index = objectStore.index("done"),
                range = IDBKeyRange.only(false);

        transaction.oncomplete = function () {
            console.log("delete transaction complete");
        }

        var request = index.openCursor(range);
        request.onsuccess = function (evt) {
            var cursor = evt.target.result;
            if (cursor) {
                console.log("key " + cursor.key + " value " + JSON.stringify(cursor.value));
                //cursor.delete();
                cursor.continue();
            }
            else {
                console.log("No more entries! Closing db");
                db.close();
                indexedDB.deleteDatabase("testDB");
            }
        };
    }

    initDb();
    //print();


})();
