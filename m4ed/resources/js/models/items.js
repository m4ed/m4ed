// Filename: models/items.js
define([
  'underscore',
  'backbone'
],
function(_, Backbone) {

    var item = Backbone.Model.extend({

        idAttribute: '_id',

        initialize: function() {
            //console.log('Item initialized.');
        }

    });

    return item;
});