// Filename: collections/assets.js
define([
  'underscore',
  'backbone',
  'models/asset'
],
function(_, Backbone, Asset) {

  var imageCollection = Backbone.Collection.extend({

    url: 'api/assets',

    model: Asset,

    initialize: function(models, options) {}

  });

  return imageCollection;
});
