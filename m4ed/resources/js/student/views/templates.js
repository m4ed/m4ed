define([
  'jquery',
  'hogan'
],
function($, hogan) {
  return {
    legend: hogan.compile($('#legend-template').html()),
    alert: hogan.compile($('#alert-template').html()),
    answerbuttons: hogan.compile($('#answerbuttons').html())
  };
});
