// Filename: multi.js
define([
  'underscore',
  'backbone'
],
function(_, Backbone) {

    var multi = Backbone.Model.extend({

        initialize: function() {
            //console.log('Item initialized.');
        }

    });

    return multi;
});
