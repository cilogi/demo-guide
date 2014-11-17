cilogi.store.StoreView =
(function(Backbone, _, renderMustache, globals) {

    var cart = globals.cart;

    return Backbone.View.extend({

        category2json: function(category) {
            var models = cart.store.withCategory(category);
            return _.map(models, function(model) {
                return model.toJSON();
            });
        },
        render: function(category) {
            var that = this;
            renderMustache(this.$el, "shop", "create", {
                models: category ? that.category2json(category) : cart.store.toJSON(),
                cart: cart.summary(),
                imageRoot: globals.imageRoot,
                storeHost: cart.store.storeHost
            });
       },

    });
})(Backbone, _, cilogi.store.renderMustache, cilogi.store.globals);