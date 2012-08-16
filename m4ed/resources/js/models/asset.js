// Filename: 
define([
  'underscore',
  'backbone'
],
function(_, Backbone) {

  var asset = Backbone.Model.extend({

    idAttribute: '_id',

    defaults: {
      'title': 'Asset',
      'desc': 'Description',
      'name': '',
      'url': 'http://placehold.it/90x90',
      'thumbnail_url': 'http://placehold.it/90x90',
      'delete_url': '',
      'delete_type': 'DELETE',
      'id': undefined,
      'type': 'image',
      'tags': [],
      'size': 0
    },

    initialize: function() {

    }

  });

  return asset;
});
