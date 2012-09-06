// Filename: views/items/list.js
define([
  'jquery',
  'underscore',
  'backbone',
  'hogan',
  'collections/items',
  'views/editor/item',
  'views/editor/editor',
  'views/editor/upload',
  'jquery.ui.touch-punch'
],
function($, _, Backbone, hogan, ItemCollection, ItemView, EditorView, UploadView) {

  var itemListView = Backbone.View.extend({

    events: {
      'sortupdate': 'onSortUpdate'
    },
    
    initialize: function(options) {

      // Extend this object with all the custom options passed
      _.extend(this, options.custom);

      this.collection = new ItemCollection();
      var collection = this.collection;

      this.collection.on('add', this.onAdd, this);

      this.$list = this.$el.find('.ui-sortable');

      // Init collection from rendered content
      this.$list.children('li').each(function(index) {
        var $li = $(this);
        collection.add({_id: $li.attr('id')}, {$el: $li});
      });

      // Make items sortable 
      if ($.support.touch) {
        // Show a handle for touch devices
        $('.item .handle').show();
        this.$list.sortable({ handle: '.handle' });
      } else {
        this.$list.sortable({ distance: 20 });
      }

      // Keep count of open editors
      this.editorsOpen = 0;

      // Bind global events
      this.globalDispatcher.on('editorOpened', this.onEditorOpened, this);
      this.globalDispatcher.on('editorClosed', this.onEditorClosed, this);  
      this.globalDispatcher.on('action:addItem', this.add, this); 

      // Create a view for the modal upload form
      this.upload = new UploadView({
        el: '#fileupload',
        custom: {
          globalDispatcher: this.globalDispatcher,
          parent: this
        }
      });

    },

    add: function() {
      this.collection.add({
        listIndex: 0,
        title: 'Click to add a title',
        desc: 'Click to add a description',
        text: '',
        tags: []
      });
    },

    onAdd: function(item, collection, options) {

      // In case of a new item sync the model and add the view to the list
      if(!options.$el) {
        console.log('Saving new item...');
        item.save({}, {
          success: _.bind(function(model, response){
            console.log('Save successful.');
            // addMethod can be 'append' or 'prepend'
            // TODO: move addMethod to options
            this.createItemView(model, {addMethod: 'prepend'});
          }, this),
          error: function(){
            console.log("Error: couldn't save item.");
          }
        });
      } else {
        this.createItemView(item, options); 
      }

    },

    createItemView: function(model, options) {

      var itemView = new ItemView({
        model: model,
        el: options.$el,
        custom: {
          dispatcher: _.clone(Backbone.Events),
          globalDispatcher: this.globalDispatcher,
          parent: this,
          templates: this.templates
        }
      });

      // Update sortable and indexes if necessary
      if (options.addMethod) {
        var order = this.$list[options.addMethod](itemView.$el).sortable('refresh').sortable('toArray');
        this.globalDispatcher.trigger('sortUpdated', order);
        // Scroll to item
        itemView.scrollTop();
        // Select the new item
        itemView.select();
      }

    },

    onSortUpdate: function(e, ui) {
      console.log('Sort updated!');
      var order = this.$list.sortable('toArray');
      this.globalDispatcher.trigger('sortUpdated', order);
    },

    onEditorOpened: function() {
      if (this.editorsOpen === 0) {
        this.$list.sortable('disable');
      }
      this.editorsOpen++;
    },

    onEditorClosed: function() {
      this.editorsOpen--;
      if (this.editorsOpen === 0) {
        this.$list.sortable('enable');
      }
    }

  });
  return itemListView;
});