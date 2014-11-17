cilogi.store.StoreCollection =

(function($, Backbone, SKUModel) {
    return Backbone.Collection.extend({
            model: SKUModel,
            loadData: function(json) {
                var that = this;
                that.reset(json.skus, {silent: true});
                that.storeName = json.storeName;
                that.storeHost = json.storeHost;
                that.clientHost = json.clientHost;
                that.categories = json.categories || [];
            },
            categoryTitle: function(id) {
                for (var i = 0; i < this.categories.length; i++) {
                    if (categories[i].id == id) {
                        return categories[i].title;
                    }
                }
                return id;
            },
            withCategory : function(category) {
                return _.filter(this.models, function(model) {
                    var categories = model.get("categories");
                    return _.contains(categories, category);
                });
            }
        });
})($, Backbone, cilogi.store.SKUModel);