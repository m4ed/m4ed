define([
    'jquery',
    'underscore',
    'backbone',
    'hogan'
],
function($, _, Backbone, hogan) {
  var multipleChoiceView = Backbone.View.extend({
    tagName: 'div',

    className: 'multiple-choice row',

    initialize: function(options) {
      _.extend(this, options.custom);
      console.log(this.block_id)
      this.template = hogan.compile(
        '{{#choices}}' +
        '<div class="span3">' +
          '<div>' +
            '<button class="btn btn-primary" data-id="{{id}}">' +
              '{{prefix}}' +
            '</button>' +
            '<span>' +
              // & to unescape the text data
              ' {{& html}}' +
            '</span>' +
            '<div class="hint {{hint_class}} hide">' +
              '<p>{{& hint }}</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '{{/choices}}'
        )
      $(this.block_id).append(this.render().el);
      location_pathname = window.location.pathname
      // Try to determine if this script was loaded in the preview window
      this.isPreview = location_pathname.indexOf('editor') >= 0;
      if (!this.isPreview) {
        split_path = location_pathname.split('/');
        // Try the last item from the path first
        // If the path ends in '/' eg. '/e/1243/' this will fail
        item_id = split_path.slice(-1);
        if (item_id === '') {
          // Assume that the second last item is the one we're looking for
          item_id = split_path.slice(-2);
        }
        self.post_url = '/api/items/' + item_id + '/answer'
      }
    },

    render: function() {
      this.$el.append(this.template.render(this.model.toJSON()));
      return this;
    },

    events: {
      'click .btn': 'onAnswerClick'
    },

    onAnswerClick: function(e) {
      var $t = this.$(e.currentTarget);
      if ($t.hasClass('answered')) {
        return;
      }
      block_id = $t.parents('span').attr('id');
      answer_id = $t.data('id');
      full_id = [block_id, answer_id].join('-');
      console.log(full_id);

      $t.toggleClass('answered');
      // console.log('.hint' + this.model.get('hint_class'))
      $t.siblings('.hint').toggleClass('hide');

      if (!this.isPreview) {
        $.ajax({
          type: 'POST',
          // 
          url: self.post_url,
          data: {
            'answer_id': answer_id,
            'block_id': block_id
          },
          dataType: 'json',
          success: function(data, textStatus, jqXHR) {
            console.log(data.res);
          }
        });
      }
    }

  })

  return multipleChoiceView;

});