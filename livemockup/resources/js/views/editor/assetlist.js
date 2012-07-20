// Filename: images/list.js
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/assets',
  'views/editor/image'
],
function($, _, Backbone, AssetCollection, ImageView) {

    var assetView = Backbone.View.extend({

        initialize: function(options) {
            var self = this;

            // Extend this object with all the custom options passed
            _.extend(this, options.custom);

            this.eventDispatcher.bind('assetChange', this.onAssetChange, this);

            this.assets = new AssetCollection();
            // Fetch will trigger the 'reset' event
            this.assets.bind('reset', this.onReset, this);
            // Listen to any destroy events from the models in collection
            this.assets.bind('destroy', this.onDestroy, this);

            this.assets.fetch();
        },

        onAssetChange: function(id) {
            //console.log('Assets have changed!');
            //console.log('ID: ' + id + ' Was in collection: ' + this.assets.get(id));
            // Check if the asset that has changed is in our collection
            if (this.assets.get(id)) {
                console.log('Some assets in my collection have changed!');
                this.assets.fetch();
            }
        },

        onReset: function() {
            this.$el.empty();
            // The second parameter is the context of 'this' in the callback
            this.assets.each(this.addImage, this)
        },

        addImage: function(model) {
            var view = new ImageView({model: model})
              , el = view.render().el
              , self = this;
            //view.bind('destroy', this.onDestroy, this);
            //view.topLevel = this.topLevel;
            // view.topLevel.bind('herpderp', function() {
            //     console.log('herping and derping');
            // });
            this.$el.append(el);
        },

        onDestroy: function(model) {
            console.log('Destroy event triggered!');
            this.eventDispatcher.trigger('assetChange', model.get('_id'));
        }
    });

    return assetView;
});
