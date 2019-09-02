/**
 * Register Page
 * es6
 */
const form2js = require('../../vendor/form2js');

const $ = require('../../jquery/jquery.js');
const {redirect} = require('../../utils.js');
const inputs = require('../modules/text-input.js');
const bootStrapErrorHandler = require('../modules/bootstrap-form-error-handler');

const w$ = window.jQuery;

const DOM_CACHE = {
  bootStrapErrorModal: w$('#bootstrap-error-modal'),
}

$('#congregation-registration-form').on('submit', function(e){

  e.preventDefault();
  let formData = form2js(this);
  $.ajax({
    url: localized.endpoints.congregation_registration,
    method: 'post',
    contentType: 'application/json',
    data: JSON.stringify(formData),
    success: (response) => {
      if(response.error.type){
        if(response.error.type === 'FORM_VALIDATION_ERROR'){
          return bootStrapErrorHandler('congregation-registration-errors', response.error.validationErrors);
        }
        if(response.error.type === 'CONGREGATION_NUMBER_REGISTERED'){
          return bootStrapErrorHandler('congregation-registration-errors', {'congregation.name': response.error.message});
        }
        if(response.error.type === 'EMAIL_ALREADY_EXISTS'){
          return bootStrapErrorHandler('congregation-registration-errors', {'user.email': response.error.message});
        }
        return DOM_CACHE.bootStrapErrorModal.modal('show');
      }
      redirect(response.data.redirect);
    },
    fail: () => {
      DOM_CACHE.bootStrapErrorModal.modal('show')
    }
  });

});
