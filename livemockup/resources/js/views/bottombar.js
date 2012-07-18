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

            this.assets.bind('reset', this.onReset, this);

            this.activeXhr = $.ajax({
                url: '/api/media',
                data: {},
                type: 'GET',
                error: function(jqXHR, textStatus, errorThrown) {
                    alert('WE FAILED!');
                },
                success: function(data, textStatus, jqXHR) {
                    self.assets.reset(data.images);
                },
                complete: function(jqHXR, textStatus) {
                     self.activeXhr = null;
                }
            });
        },

        onReset: function() {
            console.log(this.$el);
            var self = this;
            _.map(this.assets.models, function(model) {
                var el = new ImageView({model: model}).render().el;
                self.$el.append(el);
                // Make the Textarea prettier with jQueryUI
                this.$(el).draggable({
                    revert: "invalid", // when not dropped, the item will revert back to its initial position
                    containment: self.parent ? self.parent.el : "document", // stick to editor (el) if present
                    helper: "clone",
                    cursor: "move"
                });
            });
        }
    });

    return assetView;
});
