requirejs.config({
  baseUrl: 'fanstatic/livemockup/js',
  //enforceDefine: true,
  paths: {
    jquery: 'lib/jquery/jquery.min',
    jqueryui: 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.18/jquery-ui.min',
    jqueryautoellipsis: 'lib/jquery/jquery.autoellipsis.min',
    jqueryplugins: 'lib/jquery/jquery.plugins',
    json: 'lib/json/json2',
    underscore: 'lib/underscore/underscore',
    backbone: 'lib/backbone/backbone',
    domReady: 'lib/requirejs/domReady',
    wysiwym: 'lib/wysiwym/wysiwym'
  },
  shim: {
    'backbone': {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    // Plugins that aren't wrapped in define() need their dependencies
    // defined in shim config
    'jqueryui': ['jquery'],
    'jqueryautoellipsis': ['jquery'],
    'wysiwym': ['jquery']
  }
});

// , 'jquery', 'underscore', 'backbone' , $, _, Backbone
require(['app', 'domReady!'], function(App) {
  App.initialize();
});
