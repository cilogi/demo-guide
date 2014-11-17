cilogi.store.globals =
(function(Cart) {

    var cart = new Cart();


    return {
        cart: cart
    };

})(cilogi.store.CartCollection);