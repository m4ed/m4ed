// Filename: app.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/items/list'
], function($, _, Backbone, ItemListView) {
  var initialize = function() {

    new ItemListView({el: '.container'});

  };

  return {
    initialize: initialize
  };

});