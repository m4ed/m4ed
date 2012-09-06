// Filename: views/images/asseteditor.js
define([
  'underscore',
  'backbone',
  'jquery.textext.tags'
],
function(_, Backbone) {

  // key codes for keyup event
  var keyCodes = {
    27: 'esc',
    13: 'enter'
  };

  var AssetEditorView = Backbone.View.extend({

    tagName: 'div',

    className: 'asset-editor modal hide',

    initialize: function(options) {

      // Extend this object with all the custom options passed
      _.extend(this, options.custom);

      this.model.bind('change:title', this.onTitleChange, this);
      this.model.bind('destroy', this.onDestroy, this);

    },

    render: function() {

      var m = this.model;

      this.$el.append(this.template.render(this.model.toJSON()));

      this.$tags = this.$('.tags');

      this.$modalTitle = this.$('.modal-header h3');
      var $title = this.$('.title');

      this.editables = {
        title: {
          '$wrapper': $title,
          '$view': $title.children('.view'),
          '$edit': $title.children('.edit')
        }
      };

      return this;
    },

    events: {
      'shown': 'onShown',
      'hide': 'onHide',
      'click .title > .view': 'onEditableClick',
      'blur .edit': 'onEditBlur',
      'keyup.esc .edit': 'onEditKeyupEsc',
      'keyup.return .edit': 'onEditKeyupReturn',
      'tagChange .tags': 'onTagChange',
      'click .next': 'onNextClick',
      'click .prev': 'onPrevClick',
      'click .delete': 'onDeleteClick'
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
          tags: {
            items: tags ? tags : []
          },
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

    onEditableClick: function(e) {
      e.stopPropagation();
      var field = $(e.currentTarget).parent().attr('class');
      // Sync the model if it doesn't seem to have the needed field
      if (!this.model.has(field)) {
        this.model.fetch();
      }
      this.editables[field].$wrapper.addClass('editing');
      this.editables[field].$edit.select();
    },

    onEditBlur: function(e) {
      e.stopPropagation();
      this.closeEdit(true, e.currentTarget);
      return false;
    },

    onEditKeyupEsc: function(e) {
      this.closeEdit(false, e.currentTarget);
    },

    onEditKeyupReturn: function(e) {
      this.closeEdit(true, e.currentTarget);
    },

    closeEdit: function(save, target) {
      // target variable will always be an input element
      var $target = $(target)
        , attr = $target.data('attr');
      if (save) {
        //this.model.set(attr, $target.val());
        var val = $target.val();
        if (val !== '') {
          attributes = {};
          attributes[attr] = val;
          this.model.set(attributes);
        }
      } else {
        // Reset the input value if it wasn't saved
        $target.val(this.model.get(attr));
      }
      // Remove the editing class from the parent element to hide the input
      $target.parent().removeClass('editing');
    },

    onTitleChange: function(model, newTitle, options) {
      this.$modalTitle.text(newTitle);
      this.editables.title.$view.text(newTitle);
      this.editables.title.$edit.val(newTitle);
    },

    onTagChange: function(e, context) {
      this.model.set({'tags': context.result});
    },

    onHide: function(e) {
      this.model.save();
    },

    onPrevClick: function(e) {
      this.toggle();
      this.dispatcher.trigger('assetSwitch', 'prev');
    },

    onNextClick: function(e) {
      this.toggle();
      this.dispatcher.trigger('assetSwitch', 'next');
    },

    onDeleteClick: function(e) {
      e.stopPropagation();
      this.model.destroy();
    },

    onDestroy: function() {
      this.close();
    }

  });

  return AssetEditorView;

});
