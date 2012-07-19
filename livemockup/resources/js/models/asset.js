// Filename: 
define([
  'underscore',
  'backbone'
],
function(_, Backbone) {

    var imageModel = Backbone.Model.extend({

        defaults: {
            title: 'Herpderp',
            alt: 'asset',
            markdown: '### Title',
            thumb: 'http://placehold.it/150x100'
        },

        initialize: function() {

        }

    });

    return imageModel;
});
