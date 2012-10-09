// Filename: images/list.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/asset',
  'views/templates',
  'jquery.elastislide'
],
function($, _, Backbone, AssetView, templates) {

  var AssetCollection = Backbone.Collection.extend({
    url: '/api/assets'
  });

  var AssetListView = Backbone.View.extend({

    initialize: function(options) {

      this.$slider = this.$el.find('ul');

      // this.$el = this.$el.appendTo('body');

      // Extend this object with all the custom options passed
      _.extend(this, options.custom);

      // this.globalDispatcher.bind('assetChange', this.onAssetChange, this);

      // Local navigation events between Assets, AssetList and AssetEditor
      this.dispatcher.on('assetSelected', this.onAssetSelected, this);
      this.dispatcher.on('assetSwitch', this.onAssetSwitch, this);

      this.assets = new AssetCollection();
      // Fetch will trigger the 'reset' event
      this.assets.on('reset', this.onReset, this);
      // Listen to any destroy events from the models in collection
      this.assets.on('destroy', this.onDestroy, this);

      this.assets.fetch();

      this.assetViews = [];

      this.assetButtons = [{
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

      this.clearAssetViews(); 
      // The second parameter is the context of 'this' in the callback
      this.assets.each(this.addAssetView, this);
      this.loadPlugins();
      // console.log('Slider rendered.');

      this.$navPrev = this.$el.find('.es-nav-prev');
      this.$navNext = this.$el.find('.es-nav-next');

    },

    events: {
      'click': 'onClick',
      'focus': 'onFocus',
      'blur': 'onBlur',
      'keyup.left': 'onKeyupLeft',
      'keyup.right': 'onKeyupRight'
    },

    clearAssetViews: function() {
      var views = this.assetViews
        , len = views.length;
      for (var i = 0; i < len; ++i) {
        views[i].close();
      }
      this.assetViews = [];
      // console.log('Assets cleared.');
    },

    addAssetView: function(model) {
      var view = new AssetView({
            model: model,
            custom: {
              tabIndex: this.assets.indexOf(model) + 1,
              template: templates.asset,
              editorTemplate: templates.assetEditor,
              dispatcher: this.dispatcher,
              parent: this,
              mdTemplate: templates.imageMarkdown,
              buttons: this.assetButtons
            }
          })
        , $image = view.render().$el;

      this.assetViews.push(view);

      this.$slider.append($image);
    },

    loadPlugins: function() {

      if (!this.sliderLoaded) {
        this.$el.elastislide({
          // speed   : 450,  // animation speed
          // easing    : '', // animation easing effect
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
        this.sliderLoaded = true;
      } else {
        this.$el.elastislide('refresh');
      }

    },

    onClick: function(e) {
      e.stopPropagation();
      // This seems to be unnecessary (at least in Chrome)
      // if (!this.$el.hasClass('selected')) this.$el.focus();
    },

    onFocus: function(e) {
      // Remove other possible selections
      $('.asset-container').removeClass('selected');
      this.$el.addClass('selected');
    },

    onBlur: function(e) {
      this.$el.removeClass('selected');
    },

    onAssetSelected: function(model) {
      this.currentIndex = this.assets.indexOf(model);
      if (this.currentIndex !== -1) this.$el.elastislide('setCurrent', this.currentIndex);
      // var _id = model ? model.get('_id') : undefined; 
      // console.log('Asset selected - index: ' + this.currentIndex + ' id: ' + _id);
    },

    onReset: function() {
      this.render();
    },

    onDestroy: function(model, collection, options) {
      // console.log('Asset removed - id: ' + model.get('id'));
      this.render();
      var nextView = this.assetViews[options.index];
      if (nextView) {
        nextView.$el.trigger('mouseover');
      }
    },

    // This is triggered when 'next' or 'prev'
    // is clicked in asset editor
    onAssetSwitch: function (direction) {
      var view;
      if (direction === 'prev') {
        view = this.selectPrev();
      } else {
        view = this.selectNext();
      }
      if (view) {
        view.edit();
      }
    },

    selectAsset: function(index) {
      if (!this.assetViews) return;
      var current = this.assetViews[this.currentIndex];
      if (current) current.deselect();
      var view;
      if (index >= 0 && index < this.assets.length) {
        // console.log('Asset selected (index: ' + index + ')');
        this.currentIndex = index;
        view = this.assetViews[this.currentIndex];
        if (view) view.select();
      }
      return view;
    },

    selectPrev: function() {
      var ci = this.currentIndex
        , i = ci === 0 ? this.assets.length - 1 : ci - 1; 
      return this.selectAsset(i);
    },

    selectNext: function() {
      var ci = this.currentIndex
        , i = ci === this.assets.length - 1 ? 0 : ci + 1; 
      return this.selectAsset(i);
    },

    onKeyupLeft: function (e) {
      if (!this.$navPrev.is(':hidden')) this.$navPrev.click();
      this.dispatcher.trigger('hideButtons');
    },

    onKeyupRight: function (e) {
      if (!this.$navNext.is(':hidden')) this.$navNext.click();
      this.dispatcher.trigger('hideButtons');
    }
  });

  return AssetListView;
});
