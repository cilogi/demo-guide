(function($) {
    var down = true;
    
    $(document).on('pagecreate', "div[data-role='page']", function() {
        $(".blog-rect, .blog-title").click(function (e) {
            var blogRect =  $(this).parent().find(".blog-rect");
            $(this).parent().find(".blog-summary").toggleClass("active");
            if (down) {
                blogRect.removeClass("arrow_down").addClass("arrow_up");
            } else {
                blogRect.removeClass("arrow_up").addClass("arrow_down");
            }
            down = !down;
            return true;
        });
    });
})(jQuery);