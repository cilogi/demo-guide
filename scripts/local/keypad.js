// Copyright (c) 2011 Tim Niblett All Rights Reserved.
//
// File:        keypad.js.java  (16-Aug-2011)
// Author:      tim
// $
//
// Copyright in the whole and every part of this source file belongs to
// Tim Niblett (the Author) and may not be used, sold, licenced, transferred, 
// copied or reproduced in whole or in part in any manner or form or in 
// or on any media to any person other than in accordance with the terms of 
// The Author's agreement or otherwise without the prior written consent of
// The Author.
//

(function (functions, log) {

    var pad = null, exhibits = null;

    function createPad() {
        if (pad) {
            setupPad(pad);
        } else {
            $.get(cilogi.sitePrefix + "scripts/tmpl/keypadTemplate.mustache", function (data) {
                pad = $(data);
                setupPad(pad);
            })
        }
    }

    function go(iVal) {
        if (exhibits) {
            goURL(iVal);
        } else {
            $.ajax({url: cilogi.sitePrefix + "db/exhibits.json",
                success: function (data) {
                    exhibits = data;
                    goURL(iVal);
                },
                error: function (_, status, error) {
                    log("error status of call is: " + status + ", error is " + error);
                },
                dataType: "json"
            });
        }

        function goURL(iVal) {
            if (exhibits[iVal]) {
                var url = cilogi.sitePrefix + exhibits[iVal].url;
                $.mobile.changePage(url);
            }
        }
    }

    function setupPad(thePage) {
        thePage.appendTo($.mobile.pageContainer);
        $.mobile.changePage(thePage);

        var buttons = $(thePage).find("div.keypad");

        buttons.bind("vclick", function () {
            var input = $("#keypad-input");
            var text = input.text();
            var value = $(this).text();
            switch (value) {
                case "DEL":
                    if (text.length > 0) {
                        text = text.substring(0, text.length - 1);
                        input.text(text);
                    }
                    break;
                case "GO":
                    var iVal = parseInt(text, 10);

                    go(text);
                    input.text("");
                    break;
                default:
                    text = text + value;
                    input.text(text);
            }
        });

        buttons.bind("vmouseover focus", function () {
            $(this).removeClass("ui-btn-up-e").addClass("ui-btn-hover-e")
        });

        buttons.bind("vmouseout blur", function () {
            $(this).removeClass("ui-btn-hover-e").addClass("ui-btn-up-e")
        });

        buttons.bind("vmousedown", function () {
            $(this).removeClass("ui-btn-up-e").addClass("ui-btn-down-e")
        });

        buttons.bind("vmousecancel vmouseup", function () {
            $(this).removeClass("ui-btn-down-e").addClass("ui-btn-up-e")
        });
    }

    function bindPad(e) {
        e.preventDefault();

        var keypad = $("#keypad");
        var exists = keypad.length > 0;
        log("clicked on button: " + exists);
        if (!exists) {
            createPad();
        } else {
            $.mobile.changePage(keypad);
        }

        return false;
    }

    $(document).ready(function () {
        $("#keypad-button").on("vclick", bindPad);
    });

    functions.bindPad = bindPad;

    //$.template("keypad-templateNameForPath", keypadTemplate);
})(cilogi.fn, cilogi.log);