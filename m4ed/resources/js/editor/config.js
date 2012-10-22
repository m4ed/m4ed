requirejs.config({
  baseUrl: '/fanstatic/m4ed/js',
  //enforceDefine: true,
  paths: {

    'models': 'editor/models',
    'views': 'editor/views',

    // Main components
    'jquery': 'lib/jquery/jquery.min',
    'underscore': 'lib/underscore/underscore',
    'backbone': 'lib/backbone/backbone',

    // Hogan templates
    'hogan': 'lib/hogan/hogan-2.0.0.amd',

    // Require.js plugins
    'domReady': 'lib/requirejs/domReady',

    // jQuery++
    'jquerypp': 'lib/jquery/plugins/jquerypp',

    // jQuery UI
    'jquery.ui': 'lib/jquery/plugins/jquery-ui/jquery-ui.min',
    'jquery.ui.touch-punch': 'lib/jquery/plugins/jquery-ui/jquery.ui.touch-punch.min',

    // jQuery File Upload
    'jquery.fileupload': 'lib/jquery/plugins/jquery-fileupload/jquery.fileupload',
    'jquery.fileupload-ui': 'lib/jquery/plugins/jquery-fileupload/jquery.fileupload-ui',
    'jquery.fileupload-fp': 'lib/jquery/plugins/jquery-fileupload/jquery.fileupload-fp',

    // jQuery TextExt
    'jquery.textext': 'lib/jquery/plugins/jquery-textext/textext.core',
    'jquery.textext.tags': 'lib/jquery/plugins/jquery-textext/textext.plugin.tags',
    'jquery.textext.prompt': 'lib/jquery/plugins/jquery-textext/textext.plugin.prompt',
    'jquery.textext.focus': 'lib/jquery/plugins/jquery-textext/textext.plugin.focus',

    // Other jQuery plugins
    'jquery.autoellipsis': 'lib/jquery/plugins/jquery.autoellipsis.min',
    'jquery.elastislide': 'lib/jquery/plugins/jquery.elastislide',
    'jquery.hotkeys': 'lib/jquery/plugins/jquery.hotkeys',
    'jquery.plugins': 'lib/jquery/plugins/jquery.plugins',
    'jquery.csrf': 'lib/jquery/plugins/jquery.csrf',
    'jquery.postmessage': 'lib/jquery/plugins/jquery.postmessage',

    // Utils
    'canvas-to-blob': 'lib/util/canvas-to-blob.min',
    'load-image': 'lib/util/load-image.min',
    'tmpl': 'lib/util/tmpl.min',
    'json': 'lib/util/json2',

    // Mediaelement.js
    'mediaelement': 'lib/mediaelement/mediaelement',

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

    'jquery.ui': ['jquery'],
    'jquery.ui.touch-punch': ['jquery.ui'],
    'jquery.autoellipsis': ['jquery'],
    'jquery.elastislide': ['jquery'],
    'jquery.hoverintent': ['jquery'],
    'jquery.hotkeys': ['jquery'],
    'jquery.textext': ['jquery'],
    'jquery.textext.tags': ['jquery.textext'],
    'jquery.textext.prompt': ['jquery.textext'],
    'jquery.textext.focus': ['jquery.textext'],

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

