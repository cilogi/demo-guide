cilogi.store.ItemView =
        (function ($, Backbone, renderMustache, globals, log) {

            function createOptions(selected, options) {
                var out = [],
                    sel = selected ? selected : options[0];
                for (var i = 0; i < options.length; i++) {
                    var opt = options[i],
                        entry = { name : opt};

                    if (opt == sel) {
                        entry["sel"] = true;
                    }
                    out.push(entry);
                }
                return out;
            }

            return Backbone.View.extend({
                render: function (chosenOption) {
                    var item = this.model.toJSON(),
                            price = item.unitPrice,
                            option = chosenOption,
                            code;

                    if (item.options && item.options.code) {
                        code = cilogi.local[item.options.code];
                        option = chosenOption ? chosenOption : code.options[0];
                        price = price + code.price(option);
                    }

                    renderMustache(this.$el, "item", "create", {
                        item: item,
                        code: code,
                        option: option,
                        optionList: code ? createOptions(option, code.options) : null,
                        price: price,
                        cart: globals.cart.summary(),
                        imageRoot: globals.imageRoot
                    });
                    if (code) {
                        code.draw(globals.imageRoot + item.image, {name: option});
                    }
                    this.$el.enhanceWithin();
                },
                events: {
                    'vclick .addItem': 'addItem',
                    'change #select-frame': 'choose'
                },

                addItem: function () {
                    globals.cart.addItem(this.$(".item-id").val(), parseInt(this.$(".item-quantity").val()));
                    this.render();
                },

                choose: function (e) {
                    var val = $(e.target).val();
                    log("You've chosen: " + val);
                    this.render(val);
                    return true;
                }
            });

        })($, Backbone, cilogi.store.renderMustache, cilogi.store.globals, cilogi.log);