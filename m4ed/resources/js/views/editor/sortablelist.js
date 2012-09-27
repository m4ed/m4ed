// Filename: views/items/sortablelist.js

// NOTE: This view is extendable, not supposed to be used directly

define([
  'jquery',
  'underscore',
  'backbone',
  'hogan',
  'collections/base',
  'models/listitem',
  'views/editor/item',
  'views/editor/editor',
  'views/editor/upload',
  'jquery.ui.touch-punch'
],
function($, _, Backbone, hogan, BaseCollection, ListItemModel, ItemView, EditorView, UploadView) {

  var sortableListView = Backbone.View.extend({

    initialize: function(options) {

      // Extend this object with all the custom options passed
      _.extend(this, options.custom);

      var url = options ? options.url : undefined;
      if (!this.collection) {
        this.collection = new BaseCollection({
          url: url,
          model: ListItemModel
        });
      } 

      this.collection.on('add', this.onAdd, this);

      var collection = this.collection;

      this.$list = this.$el.find('.ui-sortable');

      // Init views
      this.collection.each(function (model){
        this.createItemView(model, {$el: this.$('#' + model.get('_id'))});
      }, this);

      // Init collection from rendered content
      // this.$list.children('li').each(function(index) {
      //   var $li = $(this);
      //   collection.add({_id: $li.attr('id')}, {$el: $li});
      // });

      // Make list sortable 
      if ($.support.touch) {
        // Show a handle for touch devices
        $('.item .handle').show();
        this.$list.sortable({ handle: '.handle' });
      } else {
        this.$list.sortable({ distance: 20 });
      }

      // Bind global events
      this.globalDispatcher.on('list:itemSelected', this.onItemSelected, this); 
      this.globalDispatcher.on('list:refresh', this.refreshSortable, this); 
      this.globalDispatcher.on('list:addNew', this.addNew, this); 
      this.globalDispatcher.on('list:duplicate', this.duplicate, this); 
      this.globalDispatcher.on('list:toggleDeletion', this.onToggleDeletion, this); 

      this.duplicateRE = / \((\d+)\)$/;

    },

    events: {
      'sortupdate': 'onSortUpdate'
    },

    addNew: function() {

      var title = 'Click to add a title';

      title = this.fixDuplicateTitle(title);

      var options = {wait: true};
      if (this.collection.length > 0) options.at = 0;

      // console.log('New item:');
      // console.log(title);

      this.collection.create({
        title: title
      }, options);

    },

    duplicate: function() {

      var source = this.selectedItem ? this.collection.get(this.selectedItem) : undefined;

      if (source) {

        var clone = source.toJSON();

        var title = clone.title.replace(this.duplicateRE, '');
        title = this.fixDuplicateTitle(title);
        clone.title = title;

        delete clone._id;

        if (clone.listIndex !== undefined) clone.listIndex++;

        // console.log('Duplicate:');
        // console.log(clone);

        this.collection.create(clone, {
          at: clone.listIndex,
          wait: true
        });

      }
    },

    fixDuplicateTitle: function(title) {

      var context = {
        title: title,
        lastN: 0,
        re: this.duplicateRE
      };

      // Loop the list for duplicate titles
      this.collection.each(function(item) {
        var title = item.get('title');
        var baseTitle = title.replace(this.re, '');
        if (baseTitle === this.title) {
          if (baseTitle !== title) {
            var match = title.match(this.re);
            if (match) {
              var n = parseInt(match[1], 10);
              if (n >= this.lastN) {
                this.lastN = n+1;
              }
            }
          } else if (this.lastN < 1) {
            this.lastN = 1;
          }
        }
      }, context);

      if (context.lastN > 0) title = title + ' (' + context.lastN + ')';

      return title;

    },

    onAdd: function(model, collection, options) {

      // The function 'createItemView' must be implemented
      // in inheriting views and the function 'addItemToDOM'
      // should be called afterwards if needed

      if (this.deletionMode) this.globalDispatcher.trigger('list:toggleDeletion');

      // In case of a new item sync the model and add the view to the list
      // if(!options.$el) {
      //   console.log('Saving model...');

      //   _.extend(this, {options: options});

      //   model.save({}, {
      //     success: _.bind(function(model, response){
      //       console.log('Save successful.');
      //       this.createItemView(model, this.options);
      //     }, this),
      //     error: function(){
      //       console.log("Error: couldn't save model.");
      //     }
      //   });
      // } else {
        this.createItemView(model, options); 
      // }

    },

    addItemToDOM: function(model, options) {

      // The view should be passed from inheriting listview
      if (options.view) {

        var $el = options.view.$el;

        var index = options.index;
        
        var $children = this.$list.children('li');
        if ($children.length === 0) {
          this.$list.append($el);
        } else {
          if (index === $children.length) {
            this.$list.append($el);
          } else if (index === 0) {
            this.$list.prepend($el);
          } else {
            var $li = $children.eq(index);
            $li.before($el);
          }
        }

        this.globalDispatcher.trigger('list:refresh');

        options.view.scrollTop();
        options.view.select();

        // Enable the buttons in context menu
        this.globalDispatcher.trigger('nav:toggleButton', 'add', 'on');
        this.globalDispatcher.trigger('nav:toggleButton', 'duplicate', 'on');
      } 

    },

    onItemSelected: function(_id) {
      var lastState = this.selectedItem ? 'on' : 'off';
      this.selectedItem = _id ? _id : undefined;
      var state = _id ? 'on' : 'off';
      if (state !== lastState) this.globalDispatcher.trigger('nav:toggleButton', 'duplicate', state);
      // console.log('List item selected: ' + _id);
    },

    onSortUpdate: function(e, ui) {
      var order = this.$list.sortable('toArray');
      console.log('Sort updated.');
      this.globalDispatcher.trigger('list:sortUpdated', order);
    },

    refreshSortable: function() {
      var order = this.$list.sortable('refresh').sortable('toArray');
      this.globalDispatcher.trigger('list:sortUpdated', order);
    },

    onToggleDeletion: function() {
      this.deletionMode = !this.deletionMode ? true : false;
    }

  });
  return sortableListView;
});