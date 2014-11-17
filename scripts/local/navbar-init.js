var cilogi = cilogi || {};

(function($, cilogi) {
    $(function(){
        $( "[data-role='header'], [data-role='footer']" ).toolbar();
        $("#close-main-panel").on("vclick", function() {
            $("#main-panel").panel("close");
        });
        $(document).on("vclick", "#external-navbar a", function(e) {
            var href = $(this).attr("href");
            cilogi.diagramId = $(this).attr("data-id");
            if ($(this).attr("data-rel") === "back") {
                $.mobile.back();
                e.preventDefault();
            } else if (href && href.indexOf("#") != 0) {
                $.mobile.changePage(href);
                e.preventDefault();
            }
        })
    });

})(jQuery, cilogi);