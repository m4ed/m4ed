// Filename: views/items/editor.js
define([
  'jquery',
  'underscore',
  'backbone',
  'lib/wysiwym/wysiwym'
],
function($, _, Backbone, wysiwym) {
  var EditorView = Backbone.View.extend({

    initialize: function(options) {
      this.attachedTo = null;
      var $el = options.el;
      this.$preview = $el.find('.preview:first')
      this.$textarea = $el.find('.editor-textarea:first')
      this.$pictureContainer = $el.find('.picture-container:first')
      this.$editorButtons = $el.find('.editor-buttons:first')

      this.attachedTo = null
      this.activeXhr = null
      this.lastContent = null

      // init wysiwym.js
      this.$textarea.wysiwym(Wysiwym.Markdown, {containerButtons: this.$editorButtons});
    }

  });

  return EditorView;

});