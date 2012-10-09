// Filename: views/items/spaceclusters.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/sortablelist',
  'views/cluster',
  'jquery.ui.touch-punch'
],
function($, _, Backbone, SortableListView, ClusterView) {

  var spaceClustersView = SortableListView.extend({

    createItemView: function(model, options) {

      // "ItemView" here is ClusterView

      var el = options ? options.$el : undefined;

      var view = new ClusterView({
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
  return spaceClustersView;
});