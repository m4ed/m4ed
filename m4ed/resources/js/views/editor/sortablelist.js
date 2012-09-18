// Filename: views/items/list.js
define([
  'jquery',
  'underscore',
  'backbone',
  'hogan',
  'collections/items',
  'views/editor/listitem',
  'views/editor/editor',
  'views/editor/upload',
  'jquery.ui.touch-punch'
],
function($, _, Backbone, hogan, ItemCollection, ItemView, EditorView, UploadView) {

  var sortableListView = Backbone.View.extend({

    events: {
      'sortupdate': 'onSortUpdate'
    },
    
    initialize: function(options) {

      // Extend this object with all the custom options passed
      _.extend(this, options.custom);

      this.items = new ItemCollection();

      this.items.on('add', this.onAdd, this);

      var items = this.items;

      this.$list = this.$el.find('.ui-sortable');

      // Init items from rendered content
      this.$list.children('li').each(function(index) {
        var $li = $(this);
        items.add({_id: $li.attr('id')}, {$el: $li});
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
      this.globalDispatcher.on('itemSelected', this.onItemSelected, this); 
      this.globalDispatcher.on('refreshSortable', this.refreshSortable, this); 
      this.globalDispatcher.on('action:addItem', this.add, this); 
      this.globalDispatcher.on('action:duplicateItem', this.duplicate, this); 
      this.globalDispatcher.on('action:toggleDeletion', this.onToggleDeletion, this); 

      // Create a view for the modal upload form
      this.upload = new UploadView({
        el: '#fileupload',
        custom: {
          globalDispatcher: this.globalDispatcher,
          parent: this
        }
      });

      this.duplicateRE = / \((\d+)\)$/;

    },

    add: function() {

      var title = 'Click to add a title';

      title = this.fixDuplicateTitle(title, this.items, this.duplicateRE);

      var options = {};
      if (this.items.length > 0) options.at = 0;

      this.items.add({
        listIndex: 0,
        title: title,
        desc: 'Click to add a description',
        text: '',
        tags: []
      }, options);
    },

    duplicate: function() {

      var source = this.selectedItem ? this.items.get(this.selectedItem) : undefined;

      if (source) {

        var index = source.get('listIndex') + 1;
        var title = source.get('title').replace(this.duplicateRE, '');

        title = this.fixDuplicateTitle(title, this.items, this.duplicateRE);

        var tags = source.get('tags');



        console.log(typeof tags);

        this.items.add({
          listIndex: index,
          title: title,
          desc: source.get('desc'),
          text: source.get('text'),
          tags: source.get('tags')
        }, {
          at: index
        });

      }
    },

    fixDuplicateTitle: function(title, items, expression) {

      var context = {
        title: title,
        lastN: 0,
        re: expression
      };

      // Check if the list already contains items with same title
      items.each(function(item) {
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

    onAdd: function(item, items, options) {

      if (this.deletionMode) this.globalDispatcher.trigger('action:toggleDeletion');

      // In case of a new item sync the model and add the view to the list
      if(!options.$el) {
        console.log('Saving new item...');

        _.extend(this, {options: options});

        item.save({}, {
          success: _.bind(function(model, response){
            console.log('Save successful.');
            this.onAddCallback(model, this.options);
          }, this),
          error: function(){
            console.log("Error: couldn't save item.");
          }
        });
      } else {
        this.onAddCallback(item, options); 
      }

    },

    onAddCallback: function(model, options) {

      var el = options ? options.$el : undefined;

      var itemView = new ItemView({
        model: model,
        el: el,
        custom: {
          dispatcher: _.clone(Backbone.Events),
          globalDispatcher: this.globalDispatcher,
          parent: this,
          templates: this.templates
        }
      })
        , $item = itemView.$el;

      // Update sortable and indexes if necessary
      if (!el) {
        // var index = this.items.indexOf(model);
        var index = options.index;
        var $children = this.$list.children('li');
        if ($children.length === 0) {
          this.$list.append($item);
        } else {
          if (index === $children.length) {
            this.$list.append($item);
          } else if (index === 0) {
            this.$list.prepend($item);
          } else {
            var $li = $children.eq(index);
            $li.before($item);
          }
        }
        this.globalDispatcher.trigger('refreshSortable');
        // Scroll to item
        itemView.scrollTop();
        // Select the new item
        itemView.select();

        this.globalDispatcher.trigger('nav:toggleButton', 'add', 'on');
        this.globalDispatcher.trigger('nav:toggleButton', 'duplicate', 'on');

      } else {
        // This block is for initial add
        this.$list.append($item);
      }

    },

    onItemSelected: function(_id) {
      this.selectedItem = _id ? _id : undefined;
      var state = _id ? 'on' : 'off';
      this.globalDispatcher.trigger('nav:toggleButton', 'duplicate', state);
      console.log('Item selected: ' + _id);
    },

    onSortUpdate: function(e, ui) {
      var order = this.$list.sortable('toArray');
      console.log('Sort updated.');
      this.globalDispatcher.trigger('sortUpdated', order);
    },

    refreshSortable: function() {
      var order = this.$list.sortable('refresh').sortable('toArray');
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
    },

    onToggleDeletion: function() {
      this.deletionMode = !this.deletionMode ? true : false;
    }

  });
  return sortableListView;
});