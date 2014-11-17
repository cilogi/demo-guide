// Copyright (c) 2012 Tim Niblett All Rights Reserved.
//
// File:        render.java  (15/05/12)
// Author:      tim
//
// Copyright in the whole and every part of this source file belongs to
// Tim Niblett (the Author) and may not be used, sold, licenced, transferred, 
// copied or reproduced in whole or in part in any manner or form or in 
// or on any media to any person other than in accordance with the terms of 
// The Author's agreement or otherwise without the prior written consent of
// The Author.
//

(function($, Mustache, namespace, templateDir) {
    var cache = {};

    function render(templateName, templateData, callback) {
        var templateString = cache[templateName];
        if (!templateString) {
            var templateUrl = templateDir + '/' + templateName + '.mustache';

            var txt = $.tmpl("client-templates/popup.tmpl", templateData);
            var html = txt.html();
            callback(html);

            /*
            $.ajax({
                url: templateUrl,
				dataType: "html",
                success: function(data) {
                    cache[templateName] = data;
                    callback(Mustache.render(data, templateData));
                },
                timeout: 5000
            });
            */
        } else {
            callback(Mustache.render(templateString, templateData));
        }

    }
    namespace.render = render;
})(jQuery, Mustache, cilogi, cilogi.templateDir || "/map/image/templates");