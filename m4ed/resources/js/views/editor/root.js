// Filename: views/items/itemlist.js
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/base',
  'views/editor/sortablelist',
  'views/editor/space',
  'jquery.ui.touch-punch'
],
function($, _, Backbone, BaseCollection, SortableListView, SpaceView) {

  var rootView = SortableListView.extend({
    
    // initialize: function(options) {

    //   // _.extend(options.custom, {
    //   //   collection: new BaseCollection({
    //   //     // url: this.model.url() + '/items',
    //   //     url: '/api/items',
    //   //     model: ItemModel
    //   //   })
    //   // });
      
    //   SortableListView.prototype.initialize.apply(this, arguments);


    // },

    createItemView: function(model, options) {

      // "ItemView" here is SpaceView

      var el = options ? options.$el : undefined;

      var view = new SpaceView({
        model: model,
        el: el,
        custom: {
          dispatcher: _.clone(Backbone.Events),
          globalDispatcher: this.globalDispatcher,
          templates: this.templates
        }
      });

      // Add the element to DOM in case it was not there already
      if (!el) {
        _.extend(options, {view: view});
        SortableListView.prototype.addItemToDOM.apply(this, arguments);
      }

    }

  });
  return rootView;
});