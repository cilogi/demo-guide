cilogi.store.app =
(function($, Store, cartView, itemView, storeView, categoryView, commitView, globals, log) {


    function trim(string) {
        return string.replace(/^\s+|\s+$/g, '');
    }

    function getId() {
        return getParameterValue("id");
    }

    function getCategory() {
        return getParameterValue("category");
    }

    function getParameterValue(parameter) {
        var idx = window.location.href.lastIndexOf("?"),
            query = (idx == -1) ? "" : window.location.href.substring(idx+1),
            vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) == parameter) {
                return decodeURIComponent(pair[1]);
            }
        }
        return null;
    }

    /*
    function getParameterValue(parameter) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) == parameter) {
                return decodeURIComponent(pair[1]);
            }
        }
    }
    */

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

    function initPages() {
        log("initPages start");
        $(document).on('pagebeforeshow', '#shop-item-page', function (event) {
            var id = getId(),
                sku = globals.cart.store.get(id);

            new itemView({el: $("#shop-item-content"), model: sku}).render();
            setupSwipe(this);
        });

        // pagebeforeshow in order to get sizes for gallery
        $(document).on('pagebeforeshow', '#shop-main-page', function (event) {
            var category = getCategory();

            new storeView({el: $('#shop-contents')}).render(category);
            log("show shop-main-page done");
        });

        $(document).on('pagebeforeshow', '#shop-category-page', function(event) {
            var categories = globals.cart.store.categories;
            new categoryView({el : $('#shop-categories')}).render(categories);
            log("category display done");
        });

        $(document).on('pagebeforeshow', '#shop-cart-page', function (event) {
            new cartView({el: $('#shop-cart')}).render();
        });

        $(document).on('pagebeforeshow', '#shop-commit-page', function (event) {
            var token   = getParameterValue("token"),
                PayerID = getParameterValue("PayerID");
            if (token) {
                var store = globals.cart.store,
                    storeHost = store.storeHost,
                    storeName = store.storeName;

                $.ajax(storeHost+"/pay/details", {
                   dataType: "json",
                   type: "POST",
                   crossDomain: true,
                   data: {
                       token: token,
                       PayerID : PayerID,
                       "Cilogi-Store-Name" : storeName
                   },
                   success: function(data) {
                       $("body").removeClass("hide-me");
                       new commitView({el: $("#shop-commit")}).render(data.cart, data.details);

                       $.ajax(storeHost+"/pay/commit", {
                           type: "POST",
                           crossDomain: true,
                           data: {
                               token: token,
                               PayerID : PayerID,
                               "Cilogi-Store-Name" : storeName
                           },
                           beforeSend : function() {
                               $.mobile.loading("show", {
                                  text: "Getting your reference from PayPal",
                                  textVisible: true,
                                  theme: "e"
                               });
                           },
                           complete : function() {
                               $.mobile.loading("hide");
                           },
                           success: function(data) {
                               $("#transactionID").html("Your PayPal reference is " + data.TransactionID);
                               $("#finalize").show();
                               //$.mobile.changePage("/index.html");
                           },
                           error: function(jqXHR, status, err) {
                               alert("Error: " + err);
                           }
                       });

                   },
                   error: function(jqXHR, status, text) {
                        alert("failure: " + text);
                   }

                });
            }
        });

        // This is needed as otherwise we can get 2 pages with the same ID in the DOM.  I think that this
        // is a bug, but anyway it causes a real problem, and this can't hurt...
        $(document).on("click touch", "#shop-categories a", function(e) {
            $("#shop-main-page").empty().remove();
        });

        log("initPages stop");
    }

    function init(dataURLBase) {
        var cart = globals.cart,
            store = new Store();

        $.ajax(cilogi.sitePrefix+"db/storeJson.json", {
           dataType: "json",
           type: "GET",
            success: function(data) {
                store.loadData(data);

                cart.store = store;
                cart.load();

                initPages();
            },
            complete: function() {
                $.mobile.initializePage();
            }
        });

        globals.imageRoot = dataURLBase + "images/";


        $(document).on("submit", ".pay", function(e) {
            var elt = $("#cart-contents"),
                storeNameField=$("#store-name-field"),
                json = cart.toShortJSON(),
                val = JSON.stringify(json);
            elt.val(val);
            storeNameField.val(cart.store.storeName);
            $("#cart-url").val(window.location.replace("cart.html", "pay-success.html"));
            /*
            e.preventDefault();
            $.ajax({
                type: "GET",
                url: "/pay",
                data: JSON.stringify(cart.toJSON()),
                success: function(data) {

                }
            });
            */
            return true;
        });

        log("init done");
    }

    return {init: init};


})($, cilogi.store.StoreCollection, cilogi.store.CartView, cilogi.store.ItemView,
   cilogi.store.StoreView, cilogi.store.CategoryView, cilogi.store.CommitView, cilogi.store.globals, cilogi.log);
