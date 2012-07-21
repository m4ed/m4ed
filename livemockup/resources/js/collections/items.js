// Filename: collections/items.js
define([
  'underscore',
  'backbone',
  'models/items'
],
function(_, Backbone, Item) {

  var itemCollection = Backbone.Collection.extend({

    url: 'api/items',

    model: Item,

    initialize: function(models, options) {}

  });

  return itemCollection;
});
