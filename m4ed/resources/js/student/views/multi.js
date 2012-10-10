define([
    'jquery',
    'underscore',
    'backbone',
    'hogan',
    'student/views/templates'
],
function($, _, Backbone, hogan, templates) {
  var multipleChoiceView = Backbone.View.extend({
    tagName: 'div',

    className: 'multiple-choice',

    initialize: function(options) {
      _.extend(this, options.custom);

      // This should be got from server
      this.layout = 'inline';

      this.template = templates.multipleChoice;
      this.alertTemplate = templates.alert;
      $(this.block_id).append(this.render().el);
      location_pathname = window.location.pathname;
      // Try to determine if this script was loaded in the preview window
      this.isPreview = location_pathname.indexOf('/edit') >= 0;
      if (!this.isPreview) {
        split_path = location_pathname.split('/');
        // Try the last item from the path first
        // If the path ends in '/' eg. '/e/1243/' this will fail
        item_id = split_path.slice(-1);
        if (item_id === '') {
          // Assume that the second last item is the one we're looking for
          item_id = split_path.slice(-2);
        }
        self.post_url = '/api/items/' + item_id + '/answer';
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
      var $target = this.$(e.currentTarget);
      if ($target.hasClass('disabled')) {
        return;
      }
      block_id = $target.parents('span').attr('id');
      answer_id = $target.data('id');
      full_id = [block_id, answer_id].join('-');
      console.log(full_id);

      $target.toggleClass('disabled');
      // console.log('.hint' + this.model.get('hint_class'))
      // $target.siblings('.hint').toggleClass('hide');

      

      // The choice selection could be better
      var choice = this.model.get('choices')[answer_id-1];

      console.log(choice);

      var $alert = $(this.alertTemplate.render({
        'alert': choice.hint,
        'alert_class': choice.hint_class
      }));

      if (this.layout === 'inline') {
        if (this.$alert) {
          this.$alert.replaceWith($alert);
        } else {
          this.$el.append($alert);          
        }
        this.$alert = $alert;
      } else {
        $target.after($alert);
      }

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

  });

  return multipleChoiceView;

});