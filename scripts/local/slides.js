

    $(document).on("swipeleft", "div[data-role=page]", function(e) {
        var me = $(this);
        console.log("swipe left");
        var link = $(this).find("link[rel='next']");
        if (link.length == 1) {
            $.mobile.changePage($(link).attr("href"), "slide", false, true);
        }
    });

    $(document).on("swiperight", "div[data-role=page]", function(e) {
        var me = $(this);
        console.log("swipe right");
        var link = $(this).find("link[rel='previous']");
        if (link.length == 1) {
            $.mobile.changePage($(link).attr("href"), "slide", true, true);
        }
    });
