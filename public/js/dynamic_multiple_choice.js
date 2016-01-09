
$(document).ready(function() {
	var answerCount = 2;	

  $('#add-answer').click(function (e){
  	$('#dynamic-group').append("<div id='answer_" + answerCount + "' class='row'><div class='col-xs-10' style='padding-right:0px;'><input class='form-control' type='text' name='" + answerCount + "' placeholder='Enter Answer Text' required /></div><div class='col-xs-2' style='padding-left:0px'><button id='remove_" + answerCount + "' value='2' class='btn btn-danger form-control' type='button'>X</button></div></div>");
  	
  	$('#remove_' + answerCount).click(function (e){
  		$(e.currentTarget).parent().parent().remove();
  	});
  	answerCount++;
  }); 
});
