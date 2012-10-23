// Filename: editor/views/listitem.js

// NOTE: This view is extendable, not supposed to be used directly

define([
  'underscore',
  'backbone',
  'views/templates',
  'jquery.plugins',
  'jquery.textext.tags',
  'jquerypp/event/resize'
],
function(_, Backbone, templates) {

  var INPUT_SPACE = 15; // Add some space to the auto-resizing input

  // This view is inheritable like suggested here:
  // http://stackoverflow.com/a/7736030

  var listItemView = Backbone.View.extend({

    tagName: 'li',

    initialize: function(options) {
      // Extend this object with all the custom options passed
      _.extend(this, options.custom);

      if (!options.el) {
        this.render();
      }

      this.$item = this.$('.item');

      this.$content = this.$('.item-content');

      var $title = this.$('.title')
        , $description = this.$('.desc');

      this.$tags = this.$('.tags');

      this.$deleteButton = this.$('.btn-remove');

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

      // Listen to changes in model
      this.model.bind('change:title', this.onTitleChange, this);
      this.model.bind('change:desc', this.onDescriptionChange, this);
      this.model.bind('destroy', this.onDestroy, this);

      this.throttledResize = _.throttle(_.bind(this.onResize, this), 500 );

      // Set title and index to model so that fetch isnt needed on add
      // this.model.set({
      //   'title': this.editables.title.$view.text(),
      //   'listIndex': this.$el.data('index')
      // });

      this.globalDispatcher.on('list:sortUpdated', this.onSortUpdated, this);
      this.globalDispatcher.on('list:itemSelected', this.onItemSelected, this);
      this.globalDispatcher.on('list:toggleDeletion', this.onToggleDeletion, this);

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
      });

    },

    render: function() {
      // console.log(this);
      this.$el
          .attr('id', this.model.get('_id'))
          // .data('index', this.model.get('listIndex'))
          .html(templates.item.render(this.model.toJSON()));

    },

    events: {
      'click .view': 'onEditableClick',
      'click .text-tags': 'onTagsClick',
      'click .edit': 'onEditClick',
      'click .item': 'onItemClick',
      'click .btn-remove': 'onDeleteClick',
      'resize': 'throttledResize',
      'blur .edit': 'onEditBlur',
      // 'blur .tags': 'onTagsBlur',
      'keyup.esc .edit': 'onEditKeyupEsc',
      'keyup.return .edit': 'onEditKeyupReturn',
      'keyup .edit': 'onEditKeyup',
      'tagChange .tags': 'onTagChange',
      'keydown.tab .edit': 'onEditKeydownTab',
      'keyup.tab .title .edit': 'onTitleEditKeyupTab',
      'keyup.tab .desc .edit': 'onDescEditKeyupTab',
      'keyup.tab .tags': 'onTagsKeyupTab',
      'keydown.shift_tab .desc .edit': 'onDescEditKeydownShiftTab',
      'keydown.shift_tab .title .edit': 'onTitleEditKeydownShiftTab',
      'keydown.shift_tab .tags': 'onTagsKeydownShiftTab',
      'keydown.tab .tags': 'onTagsKeydownTab'
    },

    onEditableClick: function(e) {
      e.stopPropagation();

      var field = $(e.currentTarget).parent().attr('class');
      if (field !== 'title' && field !== 'desc' ) return; 

      field = this.editables[field];

      // Select the item if not selected already
      if (!this.isSelected()) {
        this.select();
      }    

      field.$edit.width(field.$view.width() + INPUT_SPACE);
      field.$wrapper.addClass('editing');
      field.$edit.select();

      // Sync the model if it doesn't seem to have the needed field
      // if (!this.model.has(field)) {
      //   this.model.fetch({
      //     success: _.bind(this.onEditableClickCallback, this, field)
      //   });
      // } else {
      //   this.onEditableClickCallback(field);
      // }
  
    },

    // onEditableClickCallback: function(field) {
    //   field.$edit.width(field.$view.width() + INPUT_SPACE);
    //   field.$wrapper.addClass('editing');
    //   field.$edit.select();
    // },

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

    onItemClick: function(e) {

      e.stopPropagation();

      // Prevent editor toggle if title, description or tag edit is active
      for (var key in this.editables) {
        var field = this.editables[key];
        if (field.$wrapper.hasClass('editing')){
          this.closeEdit(true, field.$edit);
          return false;
        }
      }

      if (document.activeElement == this.$tags[0]) {
        this.$tags[0].blur();
        return false;
      } 

      // Select the item if not selected already
      if (!this.isSelected()) {
        this.select();
      }
    },

    onToggleDeletion: function(e) {
      this.$deleteButton.toggle();
    },

    onDeleteClick: function(e) {
      e.stopPropagation();
      this.$deleteButton.hide();
      this.model.destroy();
    },

    onDestroy: function(e) {
      if (this.isSelected()) this.globalDispatcher.trigger('list:itemSelected', undefined);
      this.close();
    },

    onClose: function(e) {
      this.globalDispatcher.trigger('refreshSortable');
    },

    onResize: function() {
      // Refresh TextExt input
      var textExt = this.$tags.textext()[0];
      if (textExt) textExt.invalidateBounds();
    }, 

    scrollTop: function() {
      this.offsetTop = this.$item.offset().top -
          this.$item.cssInt('margin-top') - 
          $('body').cssInt('padding-top');
      $('html:not(:animated),body:not(:animated)').animate({
        scrollTop: this.offsetTop
      }, 200);
    },
    
    select: function() {
      this.$item.addClass('selected');
      // Sync the model if it doesn't have an id
      if (!this.model.has('_id')) {
        this.model.fetch();
      }
      this.globalDispatcher.trigger('list:itemSelected', this.model.get('_id'));
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

    // onTagsBlur: function(e) {
    //   if (this.model.hasChanged('tags')) this.model.save();
    // },

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

    onTitleEditKeydownShiftTab: function(e) {
      e.preventDefault();
      this.$el.prev().find('.tags').focus();
    },

    onDescEditKeydownShiftTab: function(e) {
      e.preventDefault();
      this.editables.title.$view.click();
    },

    onTagsKeydownShiftTab: function(e) {
      e.preventDefault();
      this.editables.desc.$view.click();
    },

    onDescEditKeyupTab: function(e) {
      this.$tags.focus();
    },

    onTitleEditKeyupTab: function(e) {
      this.editables.desc.$view.click();
    },

    onEditKeydownTab: function(e) {
      // Prevent changing focus to next input
      e.preventDefault();
    },

    onTagsKeydownTab: function(e) {
      // Prevent changing focus to next input
      e.preventDefault();
    },

    onTagsKeyupTab: function(e) {
      this.$el.next().find('.title .view').click();
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

        this.model.save({'listIndex': newIndex});
        // console.log('Index updated.');

        // This used to be necessary since the api demanded the whole model

        // if (!this.model.has('text')) {
        //   this.model.fetch({
        //     success: _.bind(function(model, response) {
        //       this.onSortUpdatedCallback(model, newIndex);
        //     }, this)
        //   });
        // } else {
        //   this.onSortUpdatedCallback(this.model, newIndex);
        // }
      }

    },

    // onSortUpdatedCallback: function(model, index) {
    //   // console.log('model', model);
    //   model.save({'listIndex': index});
    //   console.log('Index updated.');
    // },

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

      this.model.save({'tags': context.result});

      // var callback = _.bind(this.saveTags, {'tags': context.result});
      // if (!this.model.has('tags')) {
      //   this.model.fetch({
      //     success: callback
      //   });
      // } else {
      //   callback(this.model);
      // }
    }

    // saveTags: function(model, response) {
    //   model.save({'tags': this.tags});
    // }

  });

  return listItemView;
});