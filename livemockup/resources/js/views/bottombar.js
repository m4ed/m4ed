// Filename: images/list.js
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/assets',
  'views/images/show'
],
function($, _, Backbone, AssetCollection, ImageView) {

    var assetView = Backbone.View.extend({

        initialize: function() {
            var self = this;
            this.assets = new AssetCollection();

            // Fetch will trigger the 'reset' event
            this.assets.bind('reset', this.onReset, this);

            this.assets.fetch();
        },

        addImage: function(model) {
            var view = new ImageView({model: model})
              , el = view.render().el
              , self = this;
            this.$el.append(el);
        },

        onReset: function() {
            // The second parameter is the context of 'this'
            this.assets.each(this.addImage, this)
        }
    });

    return assetView;
});
