/* Copyright (c) 2013 Tim Niblett All Rights Reserved.

 File:        commitView.java  (18/02/13)
 Author:      tim

 Copyright in the whole and every part of this source file belongs to
 Tim Niblett (the Author) and may not be used, sold, licenced, transferred, 
 copied or reproduced in whole or in part in any manner or form or in 
 or on any media to any person other than in accordance with the terms of 
 The Author's agreement or otherwise without the prior written consent of
 The Author.
 */

cilogi.store.CommitView =
(function($, Backbone, renderMustache, globals) {


    return Backbone.View.extend({
        render: function(cart, details) {
            var el = this.$el;

            renderMustache(el, "commit", "create", {
                 cart: cart,
                 details: details
             });
        }
    });
})($, Backbone, cilogi.store.renderMustache, cilogi.store.globals);