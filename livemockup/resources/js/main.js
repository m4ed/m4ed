requirejs.config({
  baseUrl: 'fanstatic/livemockup/js',
  //enforceDefine: true,
  paths: {
    'jquery': 'lib/jquery/jquery.min',
    'jquery.ui': 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.18/jquery-ui.min',
    'jquery.ui.touch-punch': 'lib/jquery/jquery.ui.touch-punch',
    'jquery.autoellipsis': 'lib/jquery/jquery.autoellipsis.min',
    'jquery.elastislide': 'lib/jquery/jquery.elastislide',
    'jquery.plugins': 'lib/jquery/jquery.plugins',
    'json': 'lib/json/json2',
    'underscore': 'lib/underscore/underscore',
    'backbone': 'lib/backbone/backbone',
    'hogan': 'lib/hogan/hogan',
    'domReady': 'lib/requirejs/domReady',
    'bootstrap.tooltip': '../bootstrap/js/bootstrap-tooltip',
    'bootstrap.popover': '../bootstrap/js/bootstrap-popover',
    'bootstrap.collapse': '../bootstrap/js/bootstrap-collapse',
    'bootstrap.dropdown': '../bootstrap/js/bootstrap-dropdown',
    'wysiwym': 'views/editor/wysiwym'
  },
  shim: {
    'backbone': {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    // Plugins that aren't wrapped in define() need their dependencies
    // defined in shim config
    'jquery.ui': ['jquery'],
    'jquery.ui.touch-punch': ['jquery.ui'],
    'jquery.autoellipsis': ['jquery'],
    'jquery.elastislide': ['jquery'],
    'bootstrap.collapse': ['jquery'],
    'bootstrap.dropdown': ['jquery'],
    'bootstrap.tooltip': ['jquery'],
    'bootstrap.popover': ['jquery', 'bootstrap.tooltip'],
    'wysiwym': ['jquery', 'bootstrap.tooltip', 'bootstrap.popover']

  }
});

// , 'jquery', 'underscore', 'backbone' , $, _, Backbone
require(['app', 'domReady!'], function(App) {
  App.initialize();
});
