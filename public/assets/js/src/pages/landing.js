var $ = require('../../jquery/jquery.js');
var Utils = require('../../utils.js');
const inputs = require('../modules/text-input.js');
const {standardHandler, clearErrors} = require('../modules/validationHandler');

var loginForm = $('#login-form').ajaxform({
url: '/ajax/account/login',
method: 'POST',
validation_handler: standardHandler,
success: function(response, validation_handler, $form, textStatus){

  console.log(response);

  var $generalErrorMessageContainer = $form.find('.general-error-message-container');

  clearErrors($form)
  // clear general error messages
  $form.parent().find('.general-error-message-container').html('');

  if(response.error){
    switch (response.error.name) {
      case 'FormValidationError':
        return standardHandler(response.error.validationErrors);
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
