(function () {
    var tracker = ga.create('UA-27131467-8', 'auto'); // move this here!
    window.installTrackerOverride(tracker, {host: "http://offline-analytics-proxy.appspot.com"});

    $(document).on('pageshow', '[data-role=page], [data-role=dialog]', function (event, ui) {
        try {
            if ($.mobile.activePage.attr('data-url')) {
                tracker.send('pageview', $.mobile.activePage.attr('data-url')); // remove quotes
            } else {
                tracker.send('pageview');
            }
        } catch (err) {
        }
    });
})();