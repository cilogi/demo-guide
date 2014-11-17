(function() {

    function setupSwipe(page) {
        var swipe = $(page).find('#mySwipe');
        if (swipe.length == 0) {
            return;
        }

        var w = parseInt(swipe.attr("data-width")),
            h = parseInt(swipe.attr("data-height")),
            iw = window.innerWidth,
            height = Math.min(Math.round(h * iw/w), 300);

        swipe.find(".slideImage").height(height);
        swipe.height(height+30);

        console.log("height = " + height);

        var swipeObj = swipe.Swipe({continuous: true}).data('Swipe');
        swipe.on("click", ".slideImage", function(e) {
            var image = $(this),
                width = image.width(),
                off = image.parent().offset(),
                x = e.pageX - off.left,
                range = width/4;
            if (x < range) {
                swipeObj.prev();
            } else if (width - x < range) {
                swipeObj.next();
            } else {
                var id = image.attr("data-id");
                console.log("id is " + id);
            }
            console.log("click: " + x);
        });

        swipe.on("resize", function() {
            console.log("swipe resize");
        });
    };

    $(document).on("pageshow", "#shop-item-page", function() {
        //setupSwipe(this);
    });

})();