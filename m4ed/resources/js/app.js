// Filename: app.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/editor/itemlist',
  'bootstrap.collapse',
  'bootstrap.dropdown',
  'bootstrap.modal',
  'bootstrap.transition'
], function($, _, Backbone, ItemListView) {
  var initialize = function() {

    new ItemListView({el: '.container'});

  };

  return {
    initialize: initialize
  };

});