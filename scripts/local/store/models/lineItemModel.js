cilogi.store.LineItemModel =

(function(Backbone){
    return Backbone.Model.extend({
        defaults: {
            count : 1
        },
        initialize: function() {
            var sku = this.get("sku"),
                price = sku.get("unitPrice"),
                options = sku.get("options"),
                currentOption = options ? options.values[0] : null;

            this.id = this.get("sku").id;
            this.set("currentOption", currentOption);
            this.updateUnitPrice();
            this.on("currentOption:change", function() {
                this.updateUnitPrice();
            });
        },
        updateUnitPrice: function() {
            var currentOption = this.get("currentOption"),
                sku = this.get("sku"),
                options = sku.get("options");
            this.set("unitPrice", currentOption ? sku.get("unitPrice") + options["prices"][currentOption] : sku.get("unitPrice"));

        },
        toJSON: function() {
            var sku = this.get("sku");
            return {
                count: this.get("count"),
                cost: this.get("count") * sku.get("unitPrice").toFixed(2),
                sku: sku.toJSON()
            }
        }
    });
})(Backbone);

