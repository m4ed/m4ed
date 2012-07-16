/* ===========================================================
 * editor.js - editor for the mockup
 * ========================================================== */

 // EXPERIMENTAL, NOT IN USE

!function ($, m4ed, Wysiwym) {

  "use strict"; // jshint ;_;

  m4ed.Editor = function () {

    this.init = function (element) {

      this.$el = $(element)
      this.$preview = this.$element.find('.preview:first')
      this.$textarea = this.$element.find('.editor-textarea:first')
      this.$pictureContainer = this.$element.find('.picture-container:first')
      this.$editorButtons = this.$element.find('.editor-buttons:first')

      this.attachedTo = null
      this.activeXhr = null
      this.lastContent = null

      // init wysiwym.js
      this.$textarea.wysiwym(Wysiwym.Markdown, {containerButtons: this.$editorButtons});

    }
    // Init editor

    // move editor to target item and slide it open or close it
    this.toggle = function(target) {

      // Check if editor is not attached to current item
      if (this.attachedTo !== target) {
        // Check if editor is hidden
        if (this.$el.is(':visible')) {
          // Hide editor, move it to selected item and show it
          this.$el.toggle('blind', function() {
            this.$el.appendTo(target)
            this.$el.attachedTo = target
            this.$el.toggle('blind')
          });
          return false;
        } else {
          // No need to hide, just move
          this.$el.appendTo(target)
          this.attachedTo = target
        }
      }
      // Show / hide editor 
      this.$el.toggle('blind');
      return false;
    }

    this.generatePreview = function() {
      var mdContent = this.$textarea.val();
      if (this.activeXhr || this.lastContent == mdContent) {
        return;
      }
      this.lastContent = mdContent;
      this.activeXhr = $.ajax({
        'url': '/misaka',
        'data': {'md': mdContent},
        'type': 'POST',
        'error': function(xhr) {
          this.$preview.html(xhr.html);
        },
        'success': function(response) {
          this.$preview.html(response.html);
          this.activeXhr = null;
        }
      });
    }

  }

}(window.jQuery, window.m4ed = {}, window.Wysiwym);


/* ===========================================================
 * Item
 * ========================================================== */

!function ($, m4ed) {

  "use strict"; // jshint ;_;

  m4ed.Item = function (element) {

    this.init = function(element) {

      var $element = element
      this.$element = $element
      this.$element.on('click', function() {
        m4ed.editor.toggle($element);
        window.console.log('Item clicked.')
      });

    }

  }

  m4ed.items = 

  m4ed.initItems = function(elements) {
    m4ed.items = new Item(elements);
  }


}(window.jQuery, window.m4ed);


m4ed.Editor.init($('#editor'));

m4ed.Editor.init($('#editor'));


!function ($, m4ed) {

  m4ed.initEditor($('#editor'));
  m4ed.initItems($('.item'));

}(window.jQuery, window.m4ed);


var editor = {
  activeXhr: null,
  lastContent: null
};

resize textarea and preview
editor.resize = function() {
  var self = editor;
  var w = self.$firstItem.width() / 2 - 
          self.$firstItem.cssValueAsInteger('padding-left') - 
          self.$textareaContainer.cssValueAsInteger('padding-right');
  // 2 here stands for 2 * 1px border
  // TODO: read border size from textarea
  self.$textarea.width(w - 2 * self.$textarea.cssValueAsInteger('padding-left') - 2);
  self.$textarea.parent().width(w);
  self.$textarea.resizable('option', 'minWidth', w);
  self.$textarea.resizable('option', 'maxWidth', w);
  self.$preview.width(w);
};




  // init jQuery Wysiwym
  $textarea.wysiwym(Wysiwym.Markdown, {containerButtons: $('#editor-buttons')});

  // set textarea resizeable and the preview to sync with it
  // $textarea.resizable({
  //   handles: 'se',
  //   minHeight: 100,
  //   alsoResize: '#preview'
  // });

  // let the pictures to be draggable
  $( 'img', $pictureContainer ).draggable({
    revert: "invalid", // when not dropped, the item will revert back to its initial position
    containment: $( "#editor" ).length ? "#editor" : "document", // stick to editor if present
    helper: "clone",
    cursor: "move"
  });

  // let the textarea be droppable, accepting the pictures
  $textarea.droppable({
    accept: "#picture-container > img",
    activeClass: "ui-state-highlight",
    drop: function( event, ui ) {
      $(this).insertAtCaret('Picture added.');
    }
  });

  // bind events
  $('.control-button.edit').on('click', editor.toggle);
  $('.editor-button.cancel').on('click', editor.toggle);

  $('.editor-button.pictures').on('click', function(e) {
    e.preventDefault();
    $arrow = $('#pointing-arrow');
    
    $arrow.slideToggle();
    $pictureContainer.slideToggle();
  });
  
  // bind editor.resize to window.resize (throttled)
  // var throttledResize = _.throttle(editor.resize, 100);
  // $(window).on('resize', throttledResize);
  // editor.resize();

  // set throttle for preview generation
  var throttledPreview = _.throttle(editor.generatePreview, 1000);
  $textarea.on('keyup', throttledPreview);

});

// jQuery extensions

// Insert at cursor position
$.fn.extend({
  insertAtCaret: function(myValue){
  var obj;
  if( typeof this[0].name !='undefined' ) obj = this[0];
  else obj = this;

  if ($.browser.msie) {
    obj.focus();
    sel = document.selection.createRange();
    sel.text = myValue;
    obj.focus();
    }
  else if ($.browser.mozilla || $.browser.webkit) {
    var startPos = obj.selectionStart;
    var endPos = obj.selectionEnd;
    var scrollTop = obj.scrollTop;
    obj.value = obj.value.substring(0, startPos)+myValue+obj.value.substring(endPos,obj.value.length);
    obj.focus();
    obj.selectionStart = startPos + myValue.length;
    obj.selectionEnd = startPos + myValue.length;
    obj.scrollTop = scrollTop;
  } else {
    obj.value += myValue;
    obj.focus();
   }
 }
});

// Get css value as an integer
$.fn.extend({
  cssValueAsInteger: function(property){
    var v = parseInt(this.css(property),10);
    return isNaN(v) ? 0 : v;
  }
});



