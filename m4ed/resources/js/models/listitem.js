// Filename: models/listitem.js
define([
  'models/base'
],
function(BaseModel) {

  var listItem = BaseModel.extend({
    
    defaults: {
      listIndex: 0,
      title: 'Click to add a title',
      desc: 'Click to add a description',
      tags: []
    },

    // Override sync to use collection url on create
    sync: function(method, model, options) {
      if (!options) options = {};
      if (method === 'create') options.url = model.collection.url || model.url;
      Backbone.sync(method, model, options);
    }

  });

  return listItem;

});