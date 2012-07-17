// Filename: views/items/show.js
define([
  'underscore',
  'backbone',
  'models/items'
],
function(_, Backbone, Item) {
  var ItemView = Backbone.View.extend({

    initialize: function(options) {
      console.log('ItemView initialized.');
      //this.parent = options.parent;
    },

    events: {
      // dblclick
      "dblclick": "edit",
      "mousedown": "noselect"
    },

    noselect: function(e) {
      return false;
    },

    edit: function(e) {
      e.preventDefault();
      e.stopPropagation();
      var editor = this.parent.editor
        , $editor = editor.$el
        , target = $(e.currentTarget);
      //console.log('Woop');
      // Check if editor is not attached to current item
      if (editor.attachedTo !== target) {
        // Check if editor is hidden
        if ($editor.is(':visible')) {
          // Hide editor, move it to selected item and show it
          $editor.toggle('blind', function() {
            $editor.appendTo(target);
            $editor.attachedTo = target;
            $editor.toggle('blind');
          });
          return false;
        } else {
          // No need to hide, just move
          $editor.appendTo(target);
          editor.attachedTo = target;
        }
      }
      // Show / hide editor 
      $editor.toggle('blind');
      return false;
    }
    

  });
  return ItemView;
});