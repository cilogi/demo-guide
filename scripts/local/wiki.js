(function ($, persist, log, getQueryArgument) {

    function getArgument(url, attr) {
        return getQueryArgument(url, attr);
    }

    function loadTargetWithPersistence(target, onSuccess, onError) {
        var url = "http://wiki2go.appspot.com/wiki/" + target;
        //var url = "http://localhost:8080/wiki/" + target;

        showLoading("Loading wiki/" + target);
        persist.init();
        persist.get(target, function (title, page) {
            if (page) {
                try {
                    log("already have " + target + " in local database");
                    if (onSuccess) {
                         onSuccess({title: title, contents: page, dataUrl: target});
                     }
                } finally {
                    $.mobile.loading("hide");
                }
            } else {
                $.ajax(url, {
                    type: "GET",
                    success: function (data) {
                        persist.put(target, data.title, data.contents);
                        log("persisted " + target + " to local database");
                        if (onSuccess) {
                            onSuccess(data);
                        }
                    },
                    error: onError,
                    contentType: "application/json",
                    dataType: "jsonp",
                    cache: true,
                    data: { base: window.location.origin},
                    complete: function() {
                        $.mobile.loading("hide");
                    }
                });
            }
        });

    }

    function showLoading(text) {
        var theme = $.mobile.loader.prototype.options.theme,
            msgText = text || $.mobile.loader.prototype.options.text;

        $.mobile.loading("show", {
            text: msgText,
            textVisible: true,
            theme: theme,
            textonly: false
        });
    }

    $(document).on("pageshow", "#wiki-page", function () {
        var target = getArgument(this.baseURI, "target"),
            onSuccess = function (data) {
                var contents = data.contents,
                    title = data.title,
                    page = $("#wiki-page");
                page.find("h1").html(title);
                $("#wiki-content").replaceWith(contents);
                $("#wiki-content").trigger("create");
            },
            onError = function (jqxhr, text, error) {
                log("oops, can't load " + url + " text: " + text + " error: " + error);
            };

        loadTargetWithPersistence(target, onSuccess, onError);
        log("You've landed on the wiki page with url: " + window.location);
    });

    function startsWith(string, subString) {
        return string.indexOf(subString) === 0;
    }


    $(document).on("click", ".wiki", function(e) {
        var that = $(this),
            page = that.closest("div[data-role=page]"),
            rootPath = page.attr("data-rootPath"),
            href = $(this).attr("href"),
            link = rootPath + "wiki.html?target="+href;

        log("Got a wiki link, rootPath: " + rootPath + " href: " + href + " link: " + link);
        if (href) {
            $.mobile.changePage(link);
            e.preventDefault();
        }
    });

})(jQuery, cilogi.persist, cilogi.log, cilogi.fn.getQueryArgument);