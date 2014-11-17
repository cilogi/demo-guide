(function(log) {
    "use strict";

    var diagramData = null;

    function myLog(s) {
        $("#log").append("<p>"+s+"</p>");
    }

    $(document).on('pagecreate', ".map-page", function() {
        var pageShown = false;
        //myLog("init of map page");
        var that = $(this),
            tgt = that.find(".image-map"),
            id = tgt.attr("id");

        that.bind("pageshow", function() {
            pageShown = true;
        });
        if (diagramData) {
            tgt.cilogiMap(that, diagramData[id], {pageShown: pageShown});
        } else {
            $.getJSON(cilogi.sitePrefix + "db/diagramData.json", function(data) {
                diagramData = data;
                tgt.cilogiMap(that, diagramData[id], {pageShown: pageShown});
            });
        }
    });

})(cilogi.log);

