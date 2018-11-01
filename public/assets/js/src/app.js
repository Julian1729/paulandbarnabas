var $ = require('../jquery/jquery.js');
var Utils = require('../utils.js');

var signupForm = $('#signup-form').ajaxform({
url: '/ajax/sign-up',
method: 'POST',
success: function(response, validation_handler, form){

  console.log(response);

}
});

var loginForm = $('#login-form').ajaxform({
url: '/ajax/login',
method: 'POST',
success: function(response, validation_handler, form, textStatus){

  console.log(response);

  if(response.error){
    console.log('error', response.error);
  }else if(response.data.redirect){
    Utils.redirect(response.data.redirect);
  }

}
});

(function($){

  // collect all input containers
  var $inputContainers = $('.text-input-container');

  function animateLabel(inputContainer){
    var $inputContainer = $(inputContainer); // convert to jquery object
    var $input = $($inputContainer).find('input');
    var $label = $($inputContainer).find('label');
    $input.focus(function(){
      floatLabel($label);
    });
    $input.blur(function(){
      var $this = $(this);
      // only sink label if input value is empty
      if( Utils.isEmptyString( $this.val() ) ){
        // clear value
        $this.val("");
        // put label back
        sinkLabel($label);
      }
    });
  }

  function floatLabel($label){
    $label.addClass('float');
  }

  function sinkLabel($label){
    $label.removeClass('float');
  }

  $inputContainers.each(function(){animateLabel(this)});

}($))
