// Override the navigator.sendBeacon or window.Image functions
// so that calls to Google Analytics gets sent to a proxy, where
// the calls can be batched.

(function(log, PacketControl) {
    "use strict";

    var oldImage = window.Image,
        oldSendBeacon = navigator.sendBeacon,
        oldCreateElement = document.createElement,
        packetControl = new PacketControl();

    function sendBeacon(url, data) {
        log("sending beacon to: " + url + " NOT IMPLEMENTED");
    }


    function hitFunction(options) {
        log("HIT called");
        return function(url) {
            var parse = Cilogi.parseURL(url);
                // a single hit with no checks, so will be lost when offline
            packetControl.singleHit(parse.search, options);
                // a hit which goes through the database
            packetControl.addHit(parse.search, options);
        }
    }

    function install(options) {
        var image = function(width, height) {
            if (width == 1 && height == 1) {
                Object.defineProperty(this, "src", {
                    set : hitFunction(options)
                });
                log("created image, width: " + width + " height: " + height);
            } else {
                // if its not a precise 1x1 query, use the original Image function
                return oldImage;
            }
        }
        window.Image = image;
        navigator.sendBeacon = sendBeacon;
        document.createElement = function(name) {
            return ("img" == name.toLowerCase()) ? new image(1,1) : oldCreateElement.call(this, name);

        };
    }


    function uninstall() {
        window.Image = oldImage;
        navigator.sendBeacon = oldSendBeacon;
        document.createElement = oldCreateElement;
    }

    // replace for the asynchronous code, which doesn't work well if you create images
    // while the override is in place.
    function replace(options) {
        var oldGa = window.ga, args, opt = Cilogi.extend({"host": ""}, options);
        window.ga = function() {
            install(opt);
            args = Array.prototype.slice.call(arguments, 0);
            if (args[0] == 'send') {
                args.push({'hitCallback' : uninstall});
            }
            oldGa.apply(window, args);
        }
    }

    function replaceTracker(tracker, options) {
        var oldSend = tracker.send, args, opt = Cilogi.extend({"host": ""}, options);
        tracker.send = function() {
            install(opt);
            args = Array.prototype.slice.call(arguments, 0);
            oldSend.apply(tracker, args);
            uninstall();
        }

    }


    window.installGaOverride = replace;
    window.installTrackerOverride = replaceTracker;

})(Cilogi.log, Cilogi.Control);