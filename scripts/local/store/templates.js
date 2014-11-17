
(function($, cilogi) {


    function renderMustache(templateName, templateData, partialNames) {
        var templateString = cilogi.templates.names[templateName];
        var undef = typeof partialNames == 'undefined';
        var partials = undef ? undefined : partials(partialNames);
        return Mustache.render(templateString, templateData, partials);
    }

    function partials(list) {
        var out = {};
        for (var i = 0; i < list.length; i++) {
            out.put(list[i], cilogi.templates.names[list[i]]);
        }
        return out;
    }

    cilogi.templates.renderMustache = renderMustache;

    cilogi.templates.mustacheText = function(name) {
        return cilogi.templates.names[name];
    }

})(jQuery, cilogi);