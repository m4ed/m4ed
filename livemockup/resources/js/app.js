// Filename: app.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/items/list'
], function($, _, Backbone, ItemListView) {
  var initialize = function() {

    this.homeView = new ItemListView();

  };

  return {
    initialize: initialize
  };

});