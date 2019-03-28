/**
 * Territory - Householder Contacted
 */
const $ = require('jquery');
const moment = require('moment');
const Promise = require('promise');
const form2js = require('../../vendor/form2js');
const timepicker = require('timepicker');

const errorModals = require('../modules/generic_modals');

const validators = {
  householder_contacted_form: require('../validators/HouseholderContacted')
};

const DOM_CACHE = {
  $visit_form: $('#add-visit-form'),
  $visit_form_submit_button: $('#visit-form-submit'),
  $form_error_container: $('#visit-form-errors')
};

/**
 * Activate time and  date picker
 */
(function(){

  $('#visit-time-picker').timepicker({useSelect: true});

  datepicker('#visit-date-picker', {
    startDate: new Date(),
    formatter: function(el, date, instance){
      // format date Saturday March 26, 2019
      var formattedDate = moment(date.getTime()).format('MMMM Do, YYYY');
      el.value = formattedDate;
    }
  });

}());


/**
 * Handle form submission
 */
(function(){

  var $btn = DOM_CACHE.$visit_form_submit_button;

  $btn.click(formSubmission);

  function formSubmission(){
    var formData = form2js(DOM_CACHE.$visit_form[0]);
    var validation = validators.householder_contacted_form(formData);
    if(validation !== undefined){
      console.log(validation);
      // validation failed, display error messages
      return validationHandler(validation);
    }
    // send ajax request
    sendData(formData);
  }


  function constructTimestamp(){

  }

  /**
   * Organize data to send
   * @param  {[type]} formData Form data
   * @return {Promise}
   */
  function sendData(formData){

    $.ajax({
      url: window.rajax_visit_url,
      method: 'post',
      data: {
        householders_contacted: formData.householders.contacted,
        contacted_by: formData.publisher.name,
        details: formData.visit.details,
        // timestamp: timestamp,
        id: null
      },
      success: function(r){
        console.log(r);
        return Promise.resolve();
      },
      error: function(){
        errorModals.request_error_modal.show();
      }
    });

  }

  function validationHandler(validation){
    var $container = DOM_CACHE.$form_error_container;
    $container.html('');
    for (var name in validation) {
      if (validation.hasOwnProperty(name)) {
        var errorMessages = validation[name];
        errorMessages.forEach(function(msg){
          $container.append('<div class="alert alert-danger" role="alert">' + msg + '</div>')
        });
      }
    }
    // scroll to top
    $("html, body").animate({ scrollTop: 0 }, "slow");
  }

}())
