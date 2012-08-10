 // Filename: views/items/editor.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/editor/templates',
  'jquery.ui',
  'jquery.fileupload-ui',
  'jquery.plugins'
],
function($, _, Backbone, templates) {
  var UploadView = Backbone.View.extend({

    initialize: function(options) {
      // Extend this object with all the custom options passed
      _.extend(this, options.custom);

      this.$form = $('#fileupload');

      this.$form.fileupload({
          dropZone: this.$el,
          url: '/upload',
          maxFileSize: 5000000, // 5MB
          acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
          previewMaxWidth: 36,
          previewMaxHeight: 36,
          process: [
              {
                  action: 'load',
                  fileTypes: /^image\/(gif|jpeg|png)$/,
                  maxFileSize: 5000000 // 5MB
              },
              {
                  action: 'resize',
                  maxWidth: 1440,
                  maxHeight: 900
              },
              {
                  action: 'save'
              }
          ]
      });

      // console.log('UploadView initialized!');

      // this.$('#fileupload')
        // .bind('fileuploadadd', function (e, data) {console.log('File added!');})
        // .bind('fileuploadsubmit', function (e, data) {/* ... */})
        // .bind('fileuploadsend', function (e, data) {/* ... */})
        // .bind('fileuploaddone', function (e, data) {/* ... */})
        // .bind('fileuploadfail', function (e, data) {/* ... */})
        // .bind('fileuploadalways', function (e, data) {/* ... */})
        // .bind('fileuploadprogress', function (e, data) {/* ... */})
        // .bind('fileuploadprogressall', function (e, data) {/* ... */})
        // .bind('fileuploadstart', function (e) {/* ... */})
        // .bind('fileuploadstop', function (e) {/* ... */})
        // .bind('fileuploadchange', function (e, data) {/* ... */})
        // .bind('fileuploadpaste', function (e, data) {/* ... */})
        // .bind('fileuploaddrop', function (e, data) {/* ... */})
        // .bind('fileuploaddragover', function (e) {/* ... */});

      // Bind the menu button event
      $('.toggle-modal-upload').on('click', _.bind(function(){
        this.toggle();
      }, this));

      // DEBUG: Toggle the modal on init
      this.toggle();

    },

    render: function() {
      return this;
    },

    toggle: function() {
      this.$el.modal('toggle');
    },

    resize: function() {
      // var $el = this.$el;
      // $el.css({
      //   'margin-top': -($el.outerHeight() / 2),
      //   'margin-left': -($el.outerWidth() / 2)
      // });
    }


  });

  return UploadView;

});