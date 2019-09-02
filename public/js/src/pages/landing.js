/**
 * Login
 * es6
 */

const $ = require('../../jquery/jquery.js');
const {redirect} = require('../../utils');
const inputs = require('../modules/text-input.js');
const {standardHandler, clearErrors} = require('../modules/validationHandler');

/**
 * Form Submission
 */
(() => {

  const loginForm = $('#login-form').ajaxform({

    url: '/ajax/account/login',
    method: 'POST',
    validation_handler: standardHandler,
    success: (response, validation_handler, $form, textStatus) => {

      const $generalErrorMessageContainer = $form.find('.general-error-message-container');

      clearErrors($form)
      // clear general error messages
      $form.parent().find('.general-error-message-container').html('');

      if(response.error.type){
        switch (response.error.type) {
          case 'FORM_VALIDATION_ERROR':
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

})();

/**
 * Create Account button
 */
(() => {

  // button
  const $button = $('#create-account-button');
  const modal = $('#create-account-modal').pbmodal();

  $button.on('click', () => {
    modal.show();
  });

})();
