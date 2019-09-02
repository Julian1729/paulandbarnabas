/**
 * Register Page
 * es6
 */

const $ = require('../../jquery/jquery.js');
const {redirect} = require('../../utils.js');
const inputs = require('../modules/text-input.js');
const bootStrapErrorHandler = require('../modules/bootstrap-form-error-handler');

const w$ = window.jQuery;

const DOM_CACHE = {
  bootStrapErrorModal: w$('#bootstrap-error-modal'),
}

$('#user-registration-form').ajaxform({
  url: localized.endpoints.user_registration,
  method: 'post',
  success: function(response, validation_handler, form){

    if(response.error.type){
      if(response.error.type === 'FORM_VALIDATION_ERROR'){
        return bootStrapErrorHandler('user-registration-errors', response.error.validationErrors);
      }else{
        return DOM_CACHE.bootStrapErrorModal.modal('show');
      }
    }

    redirect(response.data.redirect);

  }
});
