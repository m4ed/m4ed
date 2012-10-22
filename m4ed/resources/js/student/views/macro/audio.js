define([
    'student/views/macro/base',
    'hogantemplates/audio',
    'mediaelement'
],
function(BaseView, template, mejs) {
  var audioView = BaseView.extend({

    className: 'audio',

    initialize: function(options) {

      options.template = template;
      BaseView.prototype.initialize.apply(this, arguments);

      console.log('Audio initialized but not yet rendered.');

    },

    render: function() {

      BaseView.prototype.render.apply(this, arguments);

      this.mediaElement = new mejs.MediaElement(this.$('audio')[0], {
          // shows debug errors on screen
          // enablePluginDebug: false,
          // remove or reorder to change plugin priority
          // plugins: ['flash','silverlight'],
          // specify to force MediaElement to use a particular video or audio type
          // type: '',
          // path to Flash and Silverlight plugins
          // pluginPath: '/myjsfiles/',
          // name of flash file
          // flashName: 'flashmediaelement.swf',
          // name of silverlight file
          // silverlightName: 'silverlightmediaelement.xap',
          // default if the <video width> is not specified
          // defaultVideoWidth: 480,
          // default if the <video height> is not specified
          // defaultVideoHeight: 270,
          // overrides <video width>
          // pluginWidth: -1,
          // overrides <video height>
          // pluginHeight: -1,
          // rate in milliseconds for Flash and Silverlight to fire the timeupdate event
          // larger number is less accurate, but less strain on plugin->JavaScript bridge
          // timerRate: 250,
          // method that fires when the Flash or Silverlight object is ready
          // success: function (mediaElement, domObject) {

          //     // add event listener
          //     mediaElement.addEventListener('timeupdate', function(e) {

          //         document.getElementById('current-time').innerHTML = mediaElement.currentTime;

          //     }, false);

          //     // call the play method
          //     mediaElement.play();

          // },
          // fires when a problem is detected
          error: function () {
            console.log('Failed to initialize MediaElement');
          }
      });

    },

    events: {
      'click .play': 'onPlayClick'
    },

    onPlayClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.mediaElement.play();
    }

  });

  return audioView;

});