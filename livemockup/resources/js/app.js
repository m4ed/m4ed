// Filename: app.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/items/list'
], function($, _, Backbone, ItemListView) {
  var initialize = function() {
    // init the EditorView
    //var contentView = new ContentView();
    // Blaablaa
    // var AppRouter = Backbone.Router.extend({
    //   routes: {
    //     "": "home"
    //   },
    //   initialize: function () {
    //     // init jQuery autoellipsis for descriptions
    //     $('.desc').ellipsis({'live': true});
    //   },

    //   home: function () {
    //       // Since the home view changes like a retard 
    //       if (!this.homeView) {
    //           this.homeView = new ContentView();
    //           //this.homeView.render();
    //       } else {
    //           this.homeView.delegateEvents(); // delegate events when the view is recycled
    //       }
    //       //$("#content").html(this.homeView.el);
    //       //this.headerView.select('home-menu');
    //   }
    // });

    this.homeView = new ItemListView();

  };

  return {
    initialize: initialize
  };

});