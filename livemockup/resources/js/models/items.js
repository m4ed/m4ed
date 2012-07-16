// Filename: models/items.js
define([
  'underscore',
  'backbone'
], function(_, Backbone) {

    var Item = Backbone.Model.extend({

        initialize: function() {
            console.log('Item initialized.');
        }

    });

    return Item;
});