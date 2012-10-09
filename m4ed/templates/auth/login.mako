<%inherit file="../base.mako"/>

<%block name="title">m4ed - Login / Sign up</%block>

<%block name="content">



    <div class="row">
      <div class="span6 offset3">
        <div class="well login-box">
          <div class="row">
            <div class="span6 message-wrapper">
            </div>
            <div class="span3">
              <div class="login-logo"></div>
              <h3>Login</h3>
              <form class="login-form">
                <input type="text" class="input-block-level username" placeholder="Username" name="username" value="${username}"/><br/>
                <input type="password" class="input-block-level password" placeholder="Password" name="password"
                       value="${password}"/><br/>
                <input type="submit" class="btn btn-primary submit" value="Login"/>
              </form>
            </div>

            <div class="span3">
              <h3>Sign up</h3>
              <form class="signup-form">
                <input type="text" class="input-block-level username" name="username" value="${username}" placeholder="Username"/>
                <input type="password" class="input-block-level password" name="password" value="" placeholder="Password"/>
                <input type="password" class="input-block-level password2" name="password2" value="" placeholder="Confirm password"/>
                <input type="email" class="input-block-level email" name="email" value="" placeholder="Email (optional)"/>
                <input type="submit" class="btn btn-primary submit" value="Sign up"/>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

</%block>

<%block name="scripts">

  <script id="alert-error-template" type="text/hogan">
    <div class="alert alert-error">
      <button type="button" class="close" data-dismiss="alert">×</button>
      <strong>Error!</strong> {{message}}
    </div>
  </script>

  <script>
    require(['underscore', 'backbone', 'hogan', 'domReady!', 'jquery.csrf', 'bootstrap.alert'], function(_, Backbone, hogan) {

      // TODO: Attach validator to the models
      var LoginModel = Backbone.Model.extend({
        url: '/api/login'
      });

      var SignupModel = Backbone.Model.extend({
        url: '/api/signup'
      });

      var LoginView = Backbone.View.extend({

        el: $('.login-box'),

        initialize: function() {

          this.dispatcher = _.clone(Backbone.Events);

          this.dispatcher.on('change:message', this.onMessageChange, this);

          this.templates = {};
          this.templates.alertError = hogan.compile($('#alert-error-template').html());
          this.$message = this.$('.message-wrapper');


          var login = new LoginModel({
            username: '',
            password: ''
          });

          var signup = new SignupModel({
            username: '',
            password: '',
            password2: '',
            email: ''
          });

          new FormView({
            el: $('.login-form'),
            model: login,
            custom: {
              dispatcher: this.dispatcher
            }
          });

          new FormView({
            el: $('.signup-form'),
            model: signup,
            custom: {
              dispatcher: this.dispatcher
            }
          });

        },

        onMessageChange: function(message) {
          this.$message.empty();
          if (message && message !== '') this.$message.append(this.templates.alertError.render({
            'message': message
          }));
        }, 


      });

      var FormView = Backbone.View.extend({

        initialize: function(options) {
          _.extend(this, options.custom);
        },

        events: {
          "change input": "onInputChange",
          "click .submit": "onSubmit"
        },

        onInputChange: function(e) {
          var target = $(e.currentTarget)
            , data = {};
          data[target.attr('name')] = target.val();
          this.model.set(data);
        },

        onSubmit: function(e) {
          e.preventDefault();
          this.model.save({}, {
            success: _.bind(this.onSubmitSuccess, this),
            error: _.bind(this.onSubmitError, this)
          });
          return false;
        },

        onSubmitSuccess: function(model, response) {
          window.location.href = '/';
        },

        onSubmitError: function(model, response) {
          console.log(response.toJSON());
          // Response should contain key 'message', nothin else
          this.dispatcher.trigger('change:message', response.toJSON().message);
        }

      });

      new LoginView();

    });

  </script>

</%block>