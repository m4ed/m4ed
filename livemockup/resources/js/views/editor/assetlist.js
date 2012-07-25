// Filename: images/list.js
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/assets',
  'views/editor/image',
  'hogan'
],
function($, _, Backbone, AssetCollection, ImageView, hogan) {

  var assetView = Backbone.View.extend({

    initialize: function(options) {

      // Extend this object with all the custom options passed
      _.extend(this, options.custom);

      this.imgTemplate = hogan.compile('![{{alt}}]({{src}})');

      this.globalDispatcher.bind('assetChange', this.onAssetChange, this);

      this.assets = new AssetCollection();
      // Fetch will trigger the 'reset' event
      this.assets.bind('reset', this.onReset, this);
      // Listen to any destroy events from the models in collection
      this.assets.bind('destroy', this.onDestroy, this);

      this.assets.fetch();
    },

    onAssetChange: function(assetId) {
      // This event gets triggered when some other editor view or asset list
      // notices a change in their assests.
      // Check if the asset that was changed is in our collection and handle
      // refreshing it.
      if (this.assets.get(assetId)) {
        console.log('Some assets in my collection have changed!');
        this.assets.fetch();
      }
    },

    onReset: function() {
      this.$el.empty();
      // The second parameter is the context of 'this' in the callback
      this.assets.each(this.addImage, this);
    },

    addImage: function(model) {
      var view = new ImageView({
            model: model,
            imgTemplate: this.imgTemplate,
            custom: {
              dispatcher: this.dispatcher,
              parent: this
            }
          })
        , el = view.render().el;
      //view.bind('destroy', this.onDestroy, this);

      this.$el.append(el);
    },

    onDestroy: function(model) {
      console.log('Destroy event triggered!');
      this.globalDispatcher.trigger('assetChange', model.get('_id'));
    }
  });

  return assetView;
});
