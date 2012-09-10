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

      // this.$form = this.$('#fileupload');

      this.$progress = this.$('.fileupload-progress');

      this.$el.fileupload({
          dropZone: this.$el,
          url: '/api/assets',
          maxFileSize: 10000000, // 10MB
          acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
          previewMaxWidth: 36,
          previewMaxHeight: 36,
          process: [
              {
                  action: 'load',
                  fileTypes: /^image\/(gif|jpeg|png)$/,
                  maxFileSize: 10000000 // 10MB
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

      // this.$form
        // .bind('fileuploadadd', function (e, data) {console.log('File added!');})
        // .bind('fileuploadsubmit', function (e, data) {/* ... */})
        // .bind('fileuploadsend', function (e, data) {/* ... */})
        // .bind('fileuploaddone', function (e, data) {/* ... */})
        // .bind('fileuploadfail', function (e, data) {/* ... */})
        // .bind('fileuploadalways', function (e, data) {/* ... */})
        // .bind('fileuploadprogress', function (e, data) {/* ... */})
        // .bind('fileuploadprogressall', function (e, data) {/* ... */})
        // .on('fileuploadstart', _.bind(function(e){
        //   this.onUploadStart(e);
        // }, this))
        // .on('fileuploadstop', _.bind(function(e){
        //   this.onUploadStop(e);
        // }, this));
        // .bind('fileuploadchange', function (e, data) {/* ... */})
        // .bind('fileuploadpaste', function (e, data) {/* ... */})
        // .bind('fileuploaddrop', function (e, data) {/* ... */})
        // .bind('fileuploaddragover', function (e) {/* ... */});

      // // Bind the menu button event
      // $('.toggle-modal-upload').on('click', _.bind(function(){
      //   this.toggle();
      // }, this));

    },

    events: {
      'fileuploadstart': 'onUploadStart',
      'fileuploadstop': 'onUploadStop'
    },

    render: function() {
      return this;
    },

    // toggle: function() {
    //   this.$el.modal('toggle');
    // },

    resize: function() {
      // var $el = this.$el;
      // $el.css({
      //   'margin-top': -($el.outerHeight() / 2),
      //   'margin-left': -($el.outerWidth() / 2)
      // });
    },

    onUploadStart: function(e) {
      this.$progress.slideDown();
    },
    onUploadStop: function(e) {
      this.$progress.slideUp();
    }

  });

  return UploadView;

});