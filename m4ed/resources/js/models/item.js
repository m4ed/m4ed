// Filename: models/item.js
define([
  'models/listitem'
],
function(ListItem) {

  var item = ListItem.extend({

    urlRoot: '/api/items'

  });

  return item;

});