${html_tag | n}
<script>
  require(["student/models/multi", "student/views/multi"],
    ## MC = MultipleChoice
    ## MCV = MultipleChoiceView
    function(MC,MCV){
      new MCV({
        model:new MC(${args | n}),
        custom:{
          block_id:"#m4ed-${block_id}"
        }
      });
  });
</script>