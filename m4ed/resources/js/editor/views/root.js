// Filename: views/items/itemlist.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/sortablelist',
  'views/space',
  'jquery.ui.touch-punch'
],
function($, _, Backbone, SortableListView, SpaceView) {

  var rootView = SortableListView.extend({

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