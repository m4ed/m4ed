// Filename: images/list.js
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/assets',
  'views/editor/asset',
  'views/editor/templates',
  'jquery.elastislide'
],
function($, _, Backbone, AssetCollection, AssetView, templates) {

  var AssetListView = Backbone.View.extend({

    initialize: function(options) {

      this.$slider = this.$el.find('ul');

      // this.$el = this.$el.appendTo('body');

      // Extend this object with all the custom options passed
      _.extend(this, options.custom);

      // this.globalDispatcher.bind('assetChange', this.onAssetChange, this);

      // Local navigation events between Assets, AssetList and AssetEditor
      this.dispatcher.bind('assetSelected', this.onAssetSelected, this);
      this.dispatcher.bind('assetSwitch', this.onAssetSwitch, this);
      this.dispatcher.bind('assetEdit', this.onAssetEdit, this);

      this.assets = new AssetCollection();
      // Fetch will trigger the 'reset' event
      this.assets.bind('reset', this.onReset, this);
      // Listen to any destroy events from the models in collection
      this.assets.bind('destroy', this.onDestroy, this);

      this.assets.fetch();

      this.imageButtons = [{
        classes: 'btn-inverse btn-circle btn-remove',
        icon: 'remove'
      }, {
        classes: 'btn-inverse btn-circle btn-edit',
        icon: 'edit'
      }, {
        classes: 'btn-success btn-insert',
        icon: 'arrow-up'
      }];

    },

    render: function() {
      this.$slider.empty();
      // The second parameter is the context of 'this' in the callback
      this.assets.each(this.addImage, this);
      this.loadPlugins();
      console.log('Slider rendered.');
    },

    addImage: function(model) {
      var view = new AssetView({
            model: model,
            index: this.assets.indexOf(model),
            custom: {
              template: templates.image,
              editorTemplate: templates.assetEditor,
              dispatcher: this.dispatcher,
              parent: this,
              mdTemplate: templates.imageMarkdown,
              buttons: this.imageButtons
            }
          })
        , $image = view.render().$el;

      this.$slider.append($image);
    },

    loadPlugins: function() {

      this.$el.elastislide({
        // speed   : 450,  // animation speed
        easing    : '', // animation easing effect
        imageW    : 106,  // the images width (90 + 16)
        margin    : 0,  // image margin right
        border    : 0  // image border
        // minItems  : 1,  // the minimum number of items to show. 
                  // when we resize the window, this will make sure minItems are always shown 
                  // (unless of course minItems is higher than the total number of elements)
        // current   : 0,  // index of the current item
                  // when we resize the window, the carousel will make sure this item is visible 
        // onClick   : function() { return false; } // click item callback
      });

      var ci = this.currentIndex;
      var len = this.assets.length;
      // Make sure index is beyond the array
      ci = ci > 0 ? (ci < len ? ci : len-1) : 0;
      if (ci !== this.currentIndex) this.currentIndex = ci;
      this.$el.elastislide('setCurrent', ci);

    },

    // onAssetChange: function(assetId) {
    //   // This event gets triggered when some other editor view or asset list
    //   // notices a change in their assests.
    //   // Check if the asset that was changed is in our collection and handle
    //   // refreshing it.
    //   if (this.assets.get(assetId)) {
    //     console.log('Some assets in my collection have changed!');
    //     // this.assets.fetch();
    //   }
    // },

    onAssetSelected: function(model) {
      this.currentIndex = this.assets.indexOf(model);
      if (this.currentIndex !== -1) this.$el.elastislide('setCurrent', this.currentIndex);
      var _id = model ? model.get('_id') : undefined; 
      console.log('Asset selected: index: ' + this.currentIndex + ' id: ' + _id);
    },

    onReset: function() {
      this.render();
    },

    onDestroy: function(model) {
      console.log('Destroy event triggered!');
      this.$el.elastislide('refresh', function(){
        console.log('Elastislide refreshed.');
      });
      // this.render();
      // this.globalDispatcher.trigger('assetChange', model.get('_id'));
    },

    onAssetSwitch: function (direction) {
      var newIndex = -1;
      if (direction === 'prev') {
        newIndex = this.currentIndex - 1;
      } else {
        newIndex = this.currentIndex + 1;
      }
      // if (newIndex >= 0 && newIndex < this.assets.length) {
        this.currentIndex = newIndex;
        var asset = this.assets.at(this.currentIndex);
        var _id = asset ? asset.get('_id') : undefined; 
        console.log(direction+' asset selected; index: ' + this.currentIndex + ' id: ' + _id);
        this.dispatcher.trigger('assetEdit', asset);
      // }
    },

    scrollSlider: function(dir) {
      if (dir === 'left') {
        this.$el.find('.es-nav-prev').click();
      } else if (dir === 'right') {
        this.$el.find('.es-nav-next').click();
      }
    }
  });

  return AssetListView;
});
