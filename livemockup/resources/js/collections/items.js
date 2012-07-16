// Filename: collections/items.js
define([
  'underscore',
  'backbone',
  'models/items'
], function(_, Backbone, Item) {

    var itemCollection = Backbone.Collection.extend({

        model: Item,

        initialize: function() {
          console.log('ItemCollection initialized.');
        }
        
    });

    return itemCollection;

});