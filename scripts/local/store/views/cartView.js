cilogi.store.CartView =
(function($, Backbone, renderMustache, globals) {


    return Backbone.View.extend({
        render: function() {
            var cart = globals.cart,
                cost = cart.cost(),
                shippingCost = 2.80,
                totalCost = (cost == 0) ? 0 : cost + shippingCost;

            renderMustache(this.$el, "cart", "create", {
                lines: cart.toJSON(),
                cost: cost.toFixed(2),
                shippingCost: shippingCost.toFixed(2),
                totalCost: totalCost.toFixed(2),
                imageRoot: globals.imageRoot,
                storeHost: cart.store.storeHost,
                hasContents: totalCost > 0
            });
        },
        events: {
            'click .cart-remove' : 'removeLine'
        },
        removeLine: function(e) {
            var id = $(e.currentTarget).attr("data-id");
            globals.cart.removeItem(id);
            this.render();
        }
    });
})($, Backbone, cilogi.store.renderMustache, cilogi.store.globals);