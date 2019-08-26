var $ = require('../../jquery/jquery.js');
var {redirect} = require('../../utils');
var inputs = require('../modules/text-input.js');
var {standardHandler, clearErrors} = require('../modules/validationHandler');

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

    if(response.error.type){
      switch (response.error.type) {
        case 'FORM_VALIDATIONN_ERROR':
          return standardHandler(response.error.validationErrors);
          break;
        case 'INVALID_CREDENTIALS':
          return $generalErrorMessageContainer
            .append('<p>Invalid Credentials</p>');
          break;
        default:
          return $generalErrorMessageContainer
            .append('<p>Unable to process login request</p>');
      }
    }

    redirect(response.data.redirect);

  }

});
