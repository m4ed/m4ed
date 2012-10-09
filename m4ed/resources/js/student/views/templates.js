define([
  'jquery',
  'hogan'
],
function($, hogan) {
  return {
    multipleChoice: hogan.compile($('#multiplechoice-template').html())
  };
});
