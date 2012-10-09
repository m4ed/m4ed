requirejs.config({
  baseUrl: '/fanstatic/m4ed/js',
  //enforceDefine: true,
  paths: {

    'models': 'student/models',
    'views': 'student/views',

    // Main components
    'jquery': 'lib/jquery/jquery.min',
    'underscore': 'lib/underscore/underscore',
    'backbone': 'lib/backbone/backbone',

    // Hogan templates
    'hogan': 'lib/hogan/hogan',

    // Require.js plugins
    'domReady': 'lib/requirejs/domReady',

    // jQuery++
    'jquerypp': 'lib/jquery/plugins/jquerypp',

    // jQuery UI
    'jquery.ui': 'lib/jquery/plugins/jquery-ui/jquery-ui.min',
    'jquery.ui.touch-punch': 'lib/jquery/plugins/jquery-ui/jquery.ui.touch-punch.min',

    // Other jQuery plugins
    'jquery.plugins': 'lib/jquery/plugins/jquery.plugins',
    'jquery.csrf': 'lib/jquery/plugins/jquery.csrf',

    // Utils
    'json': 'lib/util/json2',

    // Bootstrap

    'bootstrap.alert': '../bootstrap/js/bootstrap-alert',
    'bootstrap.button': '../bootstrap/js/bootstrap-button',
    'bootstrap.tooltip': '../bootstrap/js/bootstrap-tooltip',
    'bootstrap.popover': '../bootstrap/js/bootstrap-popover',
    'bootstrap.collapse': '../bootstrap/js/bootstrap-collapse',
    'bootstrap.modal': '../bootstrap/js/bootstrap-modal',
    'bootstrap.dropdown': '../bootstrap/js/bootstrap-dropdown',
    'bootstrap.transition': '../bootstrap/js/bootstrap-transition'
  },

  // Plugins that aren't wrapped in define() need their dependencies
  // defined in shim config
  shim: {
    'backbone': {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },

    'bootstrap.alert': ['jquery'],
    'bootstrap.button': ['jquery'],
    'bootstrap.collapse': ['jquery'],
    'bootstrap.modal': ['jquery'],
    'bootstrap.dropdown': ['jquery'],
    'bootstrap.transition': ['jquery'],
    'bootstrap.tooltip': ['jquery'],
    'bootstrap.popover': ['bootstrap.tooltip']

  }
});

