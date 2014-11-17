

cilogi.persist = (function(log) {
    if (window.openDatabase) {
        var dbSize = 50 * 1024 * 1024;
        var db = openDatabase('Pages', '1.0', 'page cache', dbSize);

        var success = function() {
        }
        
        var failure = function(tx, e) {
            log("Pages database error: " + e.message);
        }

        var init = function(onSuccess) {
          db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS ' +
                          'pages(url VARCHAR(255) PRIMARY KEY, title VARCHAR(255), data BLOB)', [], onSuccess || success, failure);
          });
        }

        var get = function(url, onSuccess, onFailure) {
            function ok(tx, rs) {
                var len = rs.rows.length;
                if (len == 0) {
                    log("persist: get("+url+") fail");
                    onSuccess(null, null);
                } else {
                    //log("persist: get("+url+") succeed");
                    var item = rs.rows.item(0);
                    onSuccess(item.title, item.data);
                }
            }
            db.readTransaction(function(tx) {
                tx.executeSql("SELECT title,data FROM pages WHERE url=?", [prune(url)], ok, onFailure || failure);
            });
        }

        var clear = function(onSuccess) {
            db.transaction(function(tx) {
                tx.executeSql("DROP table pages", onSuccess || success, failure);
            });
        }

        var put = function(url, title, data, onSuccess) {
            db.readTransaction(function(tx) {
                tx.executeSql("SELECT url FROM pages WHERE url=?", [prune(url)], ok, failure);
            });
            function ok(tx, results) {
                var len = results.rows.length;
                if (len == 0) {
                    db.transaction(function(txx) {
                        txx.executeSql('INSERT INTO pages(url,title, data) VALUES (?,?,?)',
                                [prune(url), title, data], onSuccess || success, failure);
                    });
                } else {
                    db.transaction(function(txx) {
                        txx.executeSql('UPDATE  pages SET title=?, data=? WHERE url=?',
                                [title, data, prune(url)], onSuccess || success, failure);
                    });
                }
            }
        }

        var remove = function(url, onSuccess) {
            db.transaction(function(tx) {
                tx.executeSql('DELETE FROM pages WHERE url=?', [prune(url)],
                    onSuccess || success, failure);
            });
        }

        var clear = function(onSuccess) {
            db.transaction(function(tx) {
                tx.executeSql("DROP TABLE IF EXISTS pages", [], onSuccess || success, failure);
            });
        }

        var prune = function(url) {
            return url.replace(location.origin,  "");
        }

        return({
            clear : clear,
            init: init,
            get : get,
            put : put,
            remove : remove
        });
    } else {
        return({
            clear : function() {},
            init: function() {},
            get : function(url, success) {
                success(null);
            },
            put : function() {},
            remove : function() {}
        });
    }
    
})(cilogi.log);

