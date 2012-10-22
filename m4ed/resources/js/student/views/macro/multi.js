define([
    'student/views/macro/base',
    'hogan',
    'hogantemplates/multi'
],
function(BaseView, Hogan, templates) {
  var multipleChoiceView = BaseView.extend({

    className: 'multiple-choice',

    initialize: function(options) {
      _.extend(this, options.custom);

      // This should be got from server
      this.showLegend = true;
      this.layout = 'inline';

      this.templates = {
        buttons:  new Hogan.Template(templates.buttons),
        legend:   new Hogan.Template(templates.legend),
        alert:    new Hogan.Template(templates.alert)
      };
      
      // this.alertTemplate = templates.alert;
      $(this.block_id).append(this.render().el);
      location_pathname = window.location.pathname;

      // Try to determine if this script was loaded in the preview window
      this.isPreview = location_pathname.indexOf('/preview') >= 0;
      
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

      var context = this.model.toJSON();

      // this.$el.append(this.template.render(context));
      // return this;

      context.show_prefix = true;
      // context.prefix_class = 'on-top';
      // context.show_content = true;
      context.btn_class = 'btn-primary';
      // context.btn_wrapper_class = '';

      var buttonCols;
      buttonCols = 3;

      var choicesLen = context.choices.length;
      if (buttonCols > choicesLen) buttonCols = choicesLen;

      if (context.show_prefix) context.btn_wrapper_class += ' btn-with-prefix';
      if (context.show_content) context.btn_wrapper_class += ' btn-with-content';
      // if (this.layout !== 'inline') context.btn_class += ' btn-fit';

      context.btn_width = this.layout === 'inline' ? 'auto' : '100%';

      if (this.layout !== 'inline' && buttonCols) {
        if (buttonCols > 1) {
        var btnW = (1 / buttonCols) * 100 - 1 + '%';
        context.btn_width = btnW;
        } else {
          context.btn_width = '100%';
        }
      }

      if (this.showLegend) this.$el.append(this.templates.legend.render(context));
      this.$el.append(this.templates.buttons.render(context));
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

      console.log(this.model.toJSON());

      console.log(choice);

      var $newAlert;
      if (choice.hint !== '') {
        $newAlert = $(this.templates.alert.render({
          'message': choice.hint,
          'alert_class': choice.hint_class,
          'strong': choice.hint_strong
        }));
      }

      if (this.layout === 'inline') {
        if ($newAlert) {
          // Test if an alert exists and is not closed (removed from DOM)
          if (this.$alert && this.$alert.parent().length !== 0) {
            this.$alert.replaceWith($newAlert);
            if (this.$alert.is(':hidden')) this.$alert.show();
          } else {
            this.$el.append($newAlert);          
          }
          this.$alert = $newAlert;
        } else if (this.$alert) {
          this.$alert.remove();
          this.$alert = undefined;    
        }
      } else {
        $target.after($newAlert);
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