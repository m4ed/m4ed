// Filename: models/base.js
define([
  'underscore',
  'backbone'
],
function(_, Backbone) {

  var baseModel = Backbone.Model.extend({
    idAttribute: '_id'
  });

  return baseModel;

});