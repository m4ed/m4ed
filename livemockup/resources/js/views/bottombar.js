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
            this.assets.bind('change', this.render, this);

            this.assets.fetch({
                error: function(jqXHR, textStatus, errorThrown) {
                    alert('WE FAILED!');
                },
                success: function(data, textStatus, jqXHR) {
                    self.assets.reset(data.images);
                }
            });
        },

        addOne: function() {
            var view = new ImageView({model: model})
              , el = view.render().el;
            $(el).draggable({
                revert: "invalid", // when not dropped, the item will revert back to its initial position
                containment: this.parent ? this.parent.el : "document", // stick to editor (el) if present
                helper: "clone",
                cursor: "move"
            });
            self.$el.append(el);
        },

        onReset: function() {
            //console.log(this.$el);
            //var self = this;
            this.assets.each(this.addOne)
            // _.map(this.assets.models, function(model) {
            //     //
                
            //     // Make the Textarea prettier with jQueryUI
            // });
        }
    });

    return assetView;
});
