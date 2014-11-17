cilogi.store.renderMustache =
(function($, log) {


    function renderMustache(element, templateName, createEvent, args) {
        var html = Mustache.render(cilogi.templates.mustacheText(templateName), args);
        element.html(html);
        if (createEvent) {
            element.trigger(createEvent);
        }
    }

    return renderMustache;

})($, cilogi.log);