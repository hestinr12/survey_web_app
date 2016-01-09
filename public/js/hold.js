
$(document).ready(function() {
	var answerCount = 2;	

  $('#add-answer').click(function (e){
  	answerCount++;
  	$('#dynamic-group').append("
  			<div id='answer_" + answerCount + "' class='row'>
  				<div class='col-md-10'>
  					<input class='form-control' type='text' name='" + answerCount + "' placeholder='Enter Answer Text' required />
  				</div>
  				<div class='col-md-2'>
  					<button id='remove_" + answerCount + "' class='btn btn-danger' type='button'>Remove</button>
  				</div>
  			</div
  		");
  });
});
