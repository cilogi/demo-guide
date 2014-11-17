var cilogi = cilogi || {};

cilogi.fn = cilogi.fn || {};

(function() {
    cilogi.fn.getQueryArgument = function (uri, attr) {
        var idx = uri.lastIndexOf("?"),
            query = (idx == -1) ? "" : uri.substring(idx+1),
            vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) == attr) {
                return decodeURIComponent(pair[1]);
            }
        }
        return "";
    }
})();