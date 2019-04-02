/**
 * Territory - Householder Contacted
 */
const moment = require('moment');
const Promise = require('promise');
const form2js = require('../../vendor/form2js');
const timepicker = require('timepicker');

// global version of jquery with bootstrap plugin enabled
const w$ = window.jQuery;

const $ = require('../../jquery/jquery');
const errorModals = require('../modules/generic_modals');

const validators = {
  householder_contacted_form: require('../validators/HouseholderContacted'),
  new_householder_form: require('../validators/NewHouseholder'),
};

const DOM_CACHE = {
  $visit_form: $('#add-visit-form'),
  $visit_form_submit_button: $('#visit-form-submit'),
  $form_error_container: $('#visit-form-errors'),
  $success_modal: $('#visit-added-modal'),
  $householder_options: $("#householder-options"),
  new_householder: {
    button: w$('#new-householder-button'),
    modal: w$('#new-householder-modal'),
    save_button: $('#save-new-householder'),
    error_container: $('#new-householder-form-errors'),
    form: $('#new-householder-form'),
  }
};

/**
 * Configure new householder button and modal
 */
(function(elements){

  var btn = elements.button;
  var modal = elements.modal;
  var saveBtn = elements.save_button;
  var form = elements.form;

  btn.on('click', showModal);

  /**
   * Show modal
   */
  function showModal(){

    modal.modal('show');

  }

  // configure modal save button
  saveBtn.on('click', saveNewHouseholder);

  function saveNewHouseholder(){
    // get form data
    var formData = form2js(form[0]);
    var validation = validators.new_householder_form(formData);
    if(validation !== undefined){
      return validationHandler(validation);
    }
    sendData(formData)
      .done(function(r){
        if(r.data.householder){
          console.log(r);
          form[0].reset();
          updateHouseholderOptions(r.data.householder);
          modal.modal('hide');
        }else{
          elements.error_container.append('<div class="alert alert-danger" role="alert">Unable to save householder</div>');
        }
      })
      .fail(function(){
        elements.error_container.append('<div class="alert alert-danger" role="alert">Unable to save householder</div>');
      });
  }

  /**
   * Add householder to selections and make selected
   * @param  {Object} householder Returned householder objet
   */
  function updateHouseholderOptions(householder){

    var html = '<label class="btn btn-secondary m-1 active" for="' + householder._id.toString() + '">' + householder.name + '<input type="checkbox" checked="checked" id="sjg" value="' + householder.name + '" name="householders.contacted[]"/></label>';
    DOM_CACHE.$householder_options.append(html);

  }

  function sendData(formData){
    return $.ajax({
      url: window.rajax_householder_url,
      method: 'post',
      data: JSON.stringify( {householder: formData.householder} ),
      contentType: "application/json"
    });
  }

  function validationHandler(validation){
    var $container = elements.error_container;
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

}(DOM_CACHE.new_householder));

/**
 * Activate time and date picker
 */
(function(){

  $('#visit-time-picker').timepicker({ 'scrollDefault': 'now' , 'timeFormat': 'h:i A'});

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
      // validation failed, display error messages
      return validationHandler(validation);
    }
    // send ajax request
    sendData(formData)
      .done(function(res){
        // init and show success modal and send to unit overview page
        if(res.data.id){
          window.location.replace(window.unit_overview_url);
        }else{
          errorModals.page_error_modal.show();
        }
      })
      .fail(function(jqXHR, textStatus, errorThrown){
        // show error modal
        errorModals.request_error_modals.show();
      });
  }


  /**
   * Use raw date and time to construct a UNIX timestamp
   * @param  {String} date
   * @param  {String} time
   * @return {Number} timestamp
   */
  function constructTimestamp(date, time){
    var combined = date + ' ' + time;
    var timestamp = moment( date + ' ' + time, 'MMMM Do, YYYY h:mm A' ).valueOf();
    return timestamp;
  }

  /**
   * Organize data to send
   * @param  {Object} formData Form data
   * @return {Promise}
   */
  function sendData(formData){

    var timestamp = constructTimestamp(formData.visit.date, formData.visit.time);
    var data = {
      householders_contacted: formData.householders.contacted,
      contacted_by: formData.publisher.name,
      details: formData.visit.details,
      timestamp: timestamp,
      id: null
    };
    var json = JSON.stringify(data);
    return $.ajax({
      url: window.rajax_visit_url,
      method: 'post',
      data: json,
      contentType: "application/json"
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
