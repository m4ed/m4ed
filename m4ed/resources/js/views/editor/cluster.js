// Filename: views/editor/cluster.js
define([
  'underscore',
  'backbone',
  'views/editor/listitem',
  'views/editor/editor'
],
function(_, Backbone, ListItemView, EditorView) {

  var clusterView = ListItemView.extend({

    // initialize: function(options) {
    //   ListItemView.prototype.initialize.apply(this, arguments);
    // },

    onItemClick: function(e) {
      // ListItemView.prototype.onItemClick.apply(this, arguments);

      window.location.href = '/c/' + this.model.get('_id') + '/edit';

      return false;

    }

  });
  return clusterView;
});