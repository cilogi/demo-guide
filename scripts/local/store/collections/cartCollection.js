cilogi.store.CartCollection =

(function(_, Backbone, LineItemModel, SKUModel, log) {

    return Backbone.Collection.extend({
        localStorage: new Backbone.LocalStorage("Cart"),
        model: LineItemModel,
        id: "cart",
        addItem: function(skuID, count) {
            var current = this.get(skuID);
            if (current) {
                current.set({count: current.get("count") + count});
            } else {
                var lineItem = new LineItemModel({ sku: this.store.get(skuID), count: count });
                this.add(lineItem);
            }
            this.save();
        },
        removeItem: function(skuID) {
            this.remove(skuID);
            this.save();
        },
        clear: function() {
            this.reset();
            this.save();
        },
        cost: function() {
            return _.reduce(this.models, function(sum, item) {
                return sum + item.get("count") * item.get("sku").get("unitPrice");
            }, 0);
        },
        count: function() {
            return _.reduce(this.models, function(sum, item) {
                return sum + item.get("count")
            }, 0);
        },
        summary: function() {
            return {cost: this.cost(), count: this.count()};
        },
        toShortJSON: function() {
            return _.map(this.models, function(model) {
                return {
                    id: model.id,
                    count: model.get("count")
                }
            });
        },
        /*
        save: function() {},
        load: function() {}
        */

        save: function() {
             Backbone.sync('create', this, {
                success: function(){
                  log('cart saved!');
                }
            });
        },
        load: function() {
            var that = this;
            Backbone.sync('read', this, {
                success: function(resp){
                    for (var i = 0; i < resp.length; i++) {
                        var item = resp[i];
                        var lineItem = new LineItemModel({
                            count: item.count,
                            sku: new SKUModel(item.sku)
                        });
                        that.push(lineItem, {silent: true});
                    }
                    //console.log("loaded " + resp.length + " lines");
                }
           });
        }

    });
})(_, Backbone, cilogi.store.LineItemModel, cilogi.store.SKUModel, cilogi.log);