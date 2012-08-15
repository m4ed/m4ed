// Filename: views/images/asseteditor.js
define([
  'underscore',
  'backbone',
  'jquery.textext.tags'
],
function(_, Backbone) {
  var AssetEditorView = Backbone.View.extend({

    tagName: 'div',

    className: 'asset-editor modal hide fade',

    initialize: function(options) {

      // Extend this object with all the custom options passed
      _.extend(this, options.custom);

    },

    render: function() {

      var m = this.model;

      this.$el.append(this.template.render({
        src: m.get('thumbnail_url'),
        alt: m.get('alt'),
        title: m.get('title')
      }));

      this.$tags = this.$('.tags');

      return this;
    },

    events: {
      'shown': 'onShown'
    },

    toggle: function() {
      this.$el.modal('toggle');
    },

    onShown: function() {
      if (!this.isShown) {
        // Init tag input after first show
        var tags = this.model.get('tags');
        this.$tags.textext({
          plugins : 'tags',
          tagsItems : tags ? tags : [],
          prompt : 'Add a tag...',
          html: {
            tag:  '<span class="text-tag label label-info">'+
                    '<span class="text-label" />'+
                    '<button type="button" class="text-remove close">×</button>'+
                  '</span>'
          }   
          // ajax : {
          //     url : '/manual/examples/data.json',
          //     dataType : 'json',
          //     cacheResults : true
          // }
        });
        this.isShown = true;
      }
    },

    onTagChange: function() {
      // this.model.tags = this.$tags.val();
      this.globalDispatcher.trigger('assetChange', model.get('_id'));
    }

  });
    
  return AssetEditorView;
});
