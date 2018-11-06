var $ = require('../../jquery/jquery.js');
var Utils = require('../../utils.js');
const inputs = require('../modules/text-input.js');

var loginForm = $('#login-form').ajaxform({
url: '/ajax/login',
method: 'POST',
validation_handler: function(validationErrors){
  for (var inputName in validationErrors) {
    if (validationErrors.hasOwnProperty(inputName)) {
      // find input-element container with corresponding input
      var $inputContainer = $('input[name=' + inputName + ']').parent();
      if($inputContainer.length) {
        // add error class
        $inputContainer.addClass('error');
        // insert error messages
        var $messageContainer = $inputContainer.next();//.find('.input-error-messages');
        var errorMessages = validationErrors[inputName];
        errorMessages.forEach(function(msg){
          $messageContainer.append('<p>' + msg + '</p>')
        });
      }
    }
  }
},
success: function(response, validation_handler, $form, textStatus){

  console.log(response);

  var $generalErrorMessageContainer = $form.find('.general-error-message-container');

  // remove error class from last submit
  $form.find('.input-element.error').each(function(){
    $(this).removeClass('error');
  });
  // remove error messages from container
  $form.find('.input-error-messages').each(function(){
    $(this).html('');
  });
  // clear general error messages
  $form.parent().find('.general-error-message-container').html('');

  if(response.error){
    switch (response.error.name) {
      case 'FormValidationError':
        return validation_handler(response.error.validationErrors);
        break;
      case 'InvalidCredentials':
        return $generalErrorMessageContainer
          .append('<p>Invalid Credentials</p>');
        break;
      default:
        return $generalErrorMessageContainer
          .append('<p>Unable to process login request</p>');
    }
  }else if(response.data.redirect){
    Utils.redirect(response.data.redirect);
  }

}
});
