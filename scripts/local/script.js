(function (log, nav, search) {

    $(document).on('pageinit', "div[data-role='page']", function (e) {

        var getCaption = function (el) {
            return $(el).next().text();
        }

        // Re-initialize with the photos for the current page

        var gallery = $("div.gallery a.swipeme, div.inline-gallery a.swipeme", e.target);
        if (gallery.length > 0) {
            gallery.photoSwipe({
                allowRotationOnUserZoom: false,
                getImageCaption: getCaption
            });
        }
        return true;


    });

    $(document).ready(function () {

        // The way I swipe the defaults don't work for me
        $.event.special.swipe.horizontalDistanceThreshold = 100;
        $.event.special.swipe.verticalDistanceThreshold = 50;

        if (search) {
            search.init();
        }

    });

    var bgCount = 0;


    $(document).on('pagecreate', "div[data-role='page']", function () {
        //log("start at" + new Date().getTime());

        var me = $(this);

        if (me.hasClass("bg")) {
            //me.addClass("bg" + bgCount);
            bgCount = (bgCount + 1) % 4;
        }
    });


    $.fn.extend({
        disableSelection: function () {
            this.each(function () {
                if (typeof this.onselectstart != 'undefined') {
                    this.onselectstart = function () {
                        return false;
                    };
                } else if (typeof this.style.MozUserSelect != 'undefined') {
                    this.style.MozUserSelect = 'none';
                } else {
                    this.onmousedown = function () {
                        return false;
                    };
                }
            });
        }
    });

    $(document).bind("pagebeforechange", function (e, data) {
        var toPage = ( typeof data.toPage === "string" ) ? data.toPage : data.toPage.jqmData("url") || "";
        //log("page url is " + toPage);
    });

    $(document).on("pageshow", "div[data-role=page]", function() {
        var name = $(this).attr("data-resourcePath");
        if (name) {
            nav.update(name);
        }
    })
})(cilogi.log, cilogi.nav, cilogi.search);