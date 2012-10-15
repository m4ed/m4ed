<div id="#m4ed-${block_id}" class="audio"></div>
<script>
  require(["student/models/audio", "student/views/audio"],
    ## A = Audio
    ## AV = AudioView
    function(A,AV){
      new AV({
        model:new A(),
        custom:{
          block_id:"#m4ed-${block_id}"
        }
      });
  });
</script>