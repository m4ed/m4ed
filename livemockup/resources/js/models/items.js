// Filename: models/items.js
define([
  'underscore',
  'backbone'
],
function(_, Backbone) {

    var item = Backbone.Model.extend({

        initialize: function() {
            //console.log('Item initialized.');
        }

    });

    return item;
});