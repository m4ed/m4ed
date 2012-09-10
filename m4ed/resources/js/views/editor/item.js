// Filename: views/editor/item.js
define([
  'underscore',
  'backbone',
  'views/editor/editor',
  'views/editor/templates',
  'jquery.plugins',
  'jquery.textext.tags',
  'jquerypp/event/resize'
],
function(_, Backbone, EditorView, templates) {

  var INPUT_SPACE = 15; // Add some space to the auto-resizing input

  var itemView = Backbone.View.extend({

    tagName: 'li',

    initialize: function(options) {
      // Extend this object with all the custom options passed
      _.extend(this, options.custom);

      // Listen to changes in model
      this.model.bind('change:title', this.onTitleChange, this);
      this.model.bind('change:desc', this.onDescriptionChange, this);

      this.editor = null;
      this.editorInitialized = false;

      this.throttledResize = _.throttle( function (e) {
        // Refresh TextExt input
        var textExt = this.$tags.textext()[0];
        if (textExt) textExt.invalidateBounds();
      }, 500 );

      if (!options.el) {
        this.render();
      }

      this.$item = this.$('.item');

      this.$content = this.$('.item-content');

      var $title = this.$('.title')
        , $description = this.$('.desc');

      this.$tags = this.$('.tags');

      this.editables = {
        title: {
          '$wrapper': $title,
          '$view': $title.children('.view'),
          '$edit': $title.children('.edit')
        },
        desc: {
          '$wrapper': $description,
          '$view': $description.children('.view'),
          '$edit': $description.children('.edit')       
        }
      };

      this.globalDispatcher.on('sortUpdated', this.onSortUpdated, this);
      this.globalDispatcher.on('itemSelected', this.onItemSelected, this);

      var tags = this.$item.data('tags');

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
      });

    },

    render: function() {
      this.$el
          .attr('id', this.model.get('_id'))
          // .data('index', this.model.get('listIndex'))
          .html(templates.item.render(this.model.toJSON()));

    },

    events: {
      'click .item-actions': 'onActionClick',
      'click .view': 'onEditableClick',
      'click .text-tags': 'onTagsClick',
      'click .edit': 'onEditClick',
      'click .item': 'onItemClick',
      'resize': 'onResize',
      'blur .edit': 'onEditBlur',
      'keyup.esc .edit': 'onEditKeyupEsc',
      'keyup.return .edit': 'onEditKeyupReturn',
      'keyup .edit': 'onEditKeyup',
      'tagChange .tags': 'onTagChange',
      'keyup.tab .edit': 'onEditKeyupTab',
      'keyup.tab .tags': 'onTagsKeyupTab'
    },

    onEditableClick: function(e) {
      e.stopPropagation();

      var field = $(e.currentTarget).parent().attr('class');
      if (field !== 'title' && field !== 'desc' ) return; 

      function swapToInput(field) {
        field.$edit.width(field.$view.width() + INPUT_SPACE);
        field.$wrapper.addClass('editing');
        field.$edit.select();
      }

      field = this.editables[field];

      // Sync the model if it doesn't seem to have the needed field
      if (!this.model.has(field)) {
        this.model.fetch({
          success: _.bind(swapToInput, this, field)
        });
      } else {
        swapToInput(field);
      }

      // Select the item if not selected already
      if (!this.isSelected()) {
        this.select();
      }      
    },

    onTagsClick: function(e) {
      e.stopPropagation();
      if (!this.isSelected()) {
        this.select();
      }       
    },

    onEditClick: function(e) {
      // This prevents clicks going through the edit input area
      e.stopPropagation();
      return false;
    },

    onActionClick: function(e) {
      // This prevents clicks going through the edit input area
      e.stopPropagation();
      return false;
    },

    onItemClick: function(e) {

      // Prevent editor toggle if title, description or tag edit is active
      for (var key in this.editables) {
        var field = this.editables[key];
        if (field.$wrapper.hasClass('editing')){
          this.closeEdit(true, field.$edit);
          e.stopPropagation();
          return false;
        }
      }

      if (document.activeElement == this.$tags[0]) {
        console.log('tags match');
        this.$tags[0].blur();
        return false;
      } 

      // Select the item if not selected already
      if (!this.isSelected()) {
        this.select();
      }

      // Check if we need a new editor view created
      if (this.editorInitialized === false) {
        this.editorInitialized = true;
        this.editor = new EditorView({
          model: this.model,
          custom: {
            globalDispatcher: this.globalDispatcher,
            dispatcher: this.dispatcher,
            parent: this
          }
        });
      } 
      this.editor.toggle();
      return false;
    },

    onResize: function () {
      this.throttledResize();
    }, 

    scrollTop: function() {
      var offset = this.$item.offset().top -
          this.$item.cssInt('margin-top') - 
          $('body').cssInt('padding-top');
      $('html:not(:animated),body:not(:animated)').animate({
        scrollTop: offset
      }, 200);
    },

    select: function() {
      this.$item.addClass('selected');
      // Sync the model if it doesn't have an id
      if (!this.model.has('_id')) {
        this.model.fetch();
      }
      this.globalDispatcher.trigger('itemSelected', this.model.get('_id'));
      this.$el.trigger('resize');
    },

    deselect: function() {
      this.$item.removeClass('selected');
      this.$el.trigger('resize');
    },

    isSelected: function() {
      return this.$item.hasClass('selected');
    },

    onItemSelected: function(_id) {
      if (this.isSelected() && _id !== this.model.get('_id')) {
        this.deselect();
      } 
    },

    onEditBlur: function(e) {
      e.stopPropagation();
      this.closeEdit(true, e.currentTarget);
      return false;
    },

    onEditKeyup: function(e) {
      var field;
      if ($(e.currentTarget).parent().attr('class').indexOf('title') !== -1) {
        field = 'title';
      } else {
        field = 'desc';
      }
      field = this.editables[field];
      if (field.$edit.val() !== "") {
        field.$view.text(field.$edit.val());
        field.$edit.width(field.$view.width() + INPUT_SPACE);
      } 
    },

    onEditKeyupEsc: function(e) {
      this.closeEdit(false, e.currentTarget);
    },

    onEditKeyupReturn: function(e) {
      this.closeEdit(true, e.currentTarget);
    },

    onEditKeyupTab: function(e) {
      // TODO: Implement me
      // Check whether the current editable is title or description
      // and move to next editable accordingly
    },

    onTagsKeyupTab: function(e) {
      // TODO: Implement me
      // If editor is open, move to the textarea.
      // Else, move to the first input of the next item.
    },

    onTitleChange: function(model, newTitle, options) {
      this.updateEditable(this.editables.title, newTitle);
    },

    onDescriptionChange: function(model, newDescription, options) {
      this.updateEditable(this.editables.desc, newDescription);
    },

    updateEditable: function(field, value) {
      field.$view.text(value);
      field.$edit.val(value);
    },

    onSortUpdated: function(order) {

      var _id = this.model.get('_id');
      var currentIndex = this.model.get('listIndex');
      var newIndex = order.indexOf(_id);
      if (newIndex !== currentIndex) {
        var callback = _.bind(this.saveIndex, {'index': newIndex});
        if (!this.model.has('title')) {
          this.model.fetch({
            success: callback
          });
        } else {
          callback(this.model);
        }
      }

    },

    saveIndex: function(model, response) {
      model.save({'listIndex': this.index});
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
          this.model.save(attributes);
        }
      } else {
        // Reset the input value if it wasn't saved
        $target.val(this.model.get(attr));
      }
      // Remove the editing class from the parent element to hide the input
      $target.parent().removeClass('editing');
    },

    onTagChange: function(e, context) {
      if (!this.model.has('tags')) {
        this.model.fetch();
      } 
      var callback = _.bind(this.saveTags, {'tags': context.result});
      if (!this.model.has('tags')) {
        this.model.fetch({
          success: callback
        });
      } else {
        callback(this.model);
      }
    },

    saveTags: function(model, response) {
      model.save({'tags': this.tags});
    }

  });
  return itemView;
});