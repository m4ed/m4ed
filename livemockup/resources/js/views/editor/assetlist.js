// Filename: images/list.js
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/assets',
  'views/editor/image',
  'hogan',
  'jquery.elastislide'
],
function($, _, Backbone, AssetCollection, ImageView, hogan) {

  var assetView = Backbone.View.extend({

    initialize: function(options) {

      this.$slider = this.$el.find('ul');

      // this.$el = this.$el.appendTo('body');

      // Extend this object with all the custom options passed
      _.extend(this, options.custom);

      // Image template for Markdown
      this.imgMDTemplate = hogan.compile('![{{alt}}]({{src}})');

      // Image template
      this.imgTemplate = hogan.compile(
        '<li>'+
          '<img alt="{{alt}}" src="{{src}}" />'+
          '<div class="buttons" style="display: none;">'+
            '{{#buttons}}'+
              '<div class="btn btn-inverse btn-circle btn-{{name}}">' +
                '<i class="icon-{{icon}} icon-white"></i>'+
              '</div>'+
            '{{/buttons}}'+
          '</div>'+
        '</li>');

      this.imgButtons = [{
        name: 'remove',
        icon: 'remove'
      }, {
        name: 'edit',
        icon: 'edit'
      }],

      this.globalDispatcher.bind('assetChange', this.onAssetChange, this);

      this.assets = new AssetCollection();
      // Fetch will trigger the 'reset' event
      this.assets.bind('reset', this.onReset, this);
      // Listen to any destroy events from the models in collection
      this.assets.bind('destroy', this.onDestroy, this);

      this.assets.fetch();
    },

    addImage: function(model) {
      var view = new ImageView({
            model: model,
            custom: {
              template: this.imgTemplate,
              dispatcher: this.dispatcher,
              parent: this,
              mdTemplate: this.imgMDTemplate,
              buttons: this.imgButtons
            }
          })
        , $image = view.render().$el;
      //view.bind('destroy', this.onDestroy, this);

      // Wrap image in slide element and append to slider

      this.$slider.append($image);
    },

    loadPlugins: function() {

      this.$el.elastislide({
        // speed   : 450,  // animation speed
        easing    : '', // animation easing effect
        imageW    : 166,  // the images width
        margin    : 0,  // image margin right
        border    : 0  // image border
        // minItems  : 1,  // the minimum number of items to show. 
                  // when we resize the window, this will make sure minItems are always shown 
                  // (unless of course minItems is higher than the total number of elements)
        // current   : 0,  // index of the current item
                  // when we resize the window, the carousel will make sure this item is visible 
        // onClick   : function() { return false; } // click item callback
      });

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

    render: function() {
      this.$slider.empty();
      // The second parameter is the context of 'this' in the callback
      this.assets.each(this.addImage, this);
      this.loadPlugins();
    },

    onReset: function() {
      this.render();
    },

    onDestroy: function(model) {
      console.log('Destroy event triggered!');
      this.globalDispatcher.trigger('assetChange', model.get('_id'));
    },

    navigate: function(dir) {
      if (dir === 'left') {
        this.$el.find('.es-nav-prev').click();
      } else if (dir === 'right') {
        this.$el.find('.es-nav-next').click();
      }
    }
  });

  return assetView;
});
