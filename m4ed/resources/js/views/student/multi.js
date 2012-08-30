define([
    'jquery',
    'underscore',
    'backbone',
    'hogan'
],
function($, _, Backbone, hogan) {
  MultipleChoiceView = Backbone.View.extend({
    tagName: 'div',

    className: 'multiple-choice',

    initialize: function(options) {
      _.extend(this, options.custom);
      console.log(this.block_id)
      this.template = hogan.compile(
        '<ul>{{#choices}}<li data-id="{{id}}">{{pre}} {{text}}</li>{{/choices}}</ul>'
        )
      $(this.block_id).append(this.render().el);
    },

    render: function() {
      //this.model.toJSON())
      this.$el.append(this.template.render({choices: this.args}));
      return this;
    },

    events: {
      'click li': 'onAnswerClick'
    },

    onAnswerClick: function(e) {
      var trgt = this.$(e.currentTarget)
      parent_id = trgt.parents('span').attr('id')
      target_id = trgt.data('id')
      full_id = [parent_id, target_id].join('-')
      console.log(full_id)
    }

  })

  return MultipleChoiceView

});