
cilogi.store.CategoryView =
(function($, Backbone, renderMustache) {


    return Backbone.View.extend({
        render: function(categories) {
            var el = this.$el;

            renderMustache(el, "categories", "create", {
                 categories: categories
             });
        }
    });
})($, Backbone, cilogi.store.renderMustache);