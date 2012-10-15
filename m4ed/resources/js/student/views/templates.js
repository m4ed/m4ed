define([
  'jquery',
  'hogan'
],
function($, hogan) {
  return {
    multipleChoice: hogan.compile($('#multiplechoice-template').html()),
    audio: hogan.compile($('#audio-template').html())
  };
});
