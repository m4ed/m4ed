// Filename: example.js

/**
 * This is an example of how Backbone models can be extended.
 * Usually there is no need to, as the macro renderer uses
 * the Backbone.Model as a default.
 */

define([
  'underscore',
  'backbone'
],
function(_, Backbone) {

  var modelName = Backbone.Model.extend({

    initialize: function() {
      
    }

  });

  return modelName;
});
