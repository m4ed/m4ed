define(['lib/mediaelement/mediaelement.full'], function(){
  // Remove mejs and MediaElement from global scope
  MediaElement.noConflict();
  return mejs.noConflict();
});