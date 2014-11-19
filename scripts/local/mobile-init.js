// Copyright (c) 2011 Tim Niblett All Rights Reserved.
//
// File:        mobile-init.ftl  (22-Sep-2011)
// Author:      tim
//
// Copyright in the whole and every part of this source file belongs to
// Tim Niblett (the Author) and may not be used, sold, licenced, transferred,
// copied or reproduced in whole or in part in any manner or form or in
// or on any media to any person other than in accordance with the terms of
// The Author's agreement or otherwise without the prior written consent of
// The Author.
//

var cilogi = cilogi || {};

cilogi.local = cilogi.local || {};

cilogi.diagramId = null;

cilogi.log = function() {
    if((typeof console !== 'undefined')) {
        console.log(Array.prototype.slice.call(arguments, 0));
    }
}

cilogi.resourcePath = "scripts/local/mobile-init.js";
cilogi.rootPath = "../../";

cilogi.host = "http://cilogi.github.io";
cilogi.sitePrefix = "/demo-guide/";

cilogi.diagramId = null;

(function() {
    function removeFileName(path) {
        var slash = path.lastIndexOf("/");
        return (slash == -1) ? "" : path.substring(0, slash);
    }

    var resourcePath = removeFileName(cilogi.resourcePath);
    var location = removeFileName(document.URL);
    var limit = location.indexOf(resourcePath);
    if (limit == -1) {
        cilogi.root = "";
    } else if (limit == 0) {
        cilogi.root = location + "/";
    } else {
        cilogi.root = location.substring(0, limit);
    }
    //cilogi.root = (limit == -1) ? "/" : location.substring(0, limit) + "/";
    //cilogi.log("root is " + cilogi.root);
    //cilogi.log("resource path is " + cilogi.resourcePath);

    cilogi.templateDir = cilogi.root + 'client-templates';
})();