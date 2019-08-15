/**
 * Territory - Householder Contacted
 */
var moment = require('moment');
var EventEmitter = require('events').EventEmitter;
var form2js = require('../../vendor/form2js');
var timepicker = require('timepicker');

// global version of jquery with bootstrap plugin enabled
var w$ = window.jQuery;

var $ = require('../../jquery/jquery');
var bootstrapValidationHandler = require('../modules/bootstrap-form-error-handler');

/**
 * Cached DOM elements
 */
var DOM_CACHE = {
  $errorModal: w$('#bootstrap-error-modal'),
  $visit_form: $('#add-visit-form'),
  $visit_form_submit_button: $('#visit-form-submit'),
  $form_error_container: $('#visit-form-errors'),
  $success_modal: $('#visit-added-modal'),
  $householder_options: $("#householder-options"),
  $timepicker: $('#visit-time-picker'),
  new_householder: {
    button: w$('#new-householder-button'),
    modal: w$('#new-householder-modal'),
    save_button: $('#save-new-householder'),
    error_container: $('#new-householder-form-errors'),
    form: $('#new-householder-form'),
  }
};

/**
 * Activate time and date picker
 */
DOM_CACHE.$timepicker.timepicker({ 'scrollDefault': 'now' , 'timeFormat': 'h:i A'});

datepicker('#visit-date-picker', {
  startDate: new Date(),
  formatter: function(el, date, instance){
    // format date Saturday March 26, 2019
    var formattedDate = moment(date.getTime()).format('MMMM Do, YYYY');
    el.value = formattedDate;
  }
});

/**
 * Define Householder events
 */
var HouseholderEvents = new EventEmitter();

// show "new householder" modal event
HouseholderEvents.on('modal:show', function(){

  DOM_CACHE.new_householder.modal.modal('show');

});

// hide "new householder" modal event
HouseholderEvents.on('modal:hide', function(){

  DOM_CACHE.new_householder.modal.modal('hide');

});

HouseholderEvents.on('updateList', function(householder){

  var html = '<label class="btn btn-secondary m-1 active" for="' + householder._id.toString() + '">' + householder.name + '<input type="checkbox" checked="checked" id="sjg" value="' + householder.name + '" name="householders.contacted[]"/></label>';
  DOM_CACHE.$householder_options.append(html);

});

HouseholderEvents.on('add', function(){

  // get form data
  var formData = form2js(DOM_CACHE.new_householder.form[0]);
  // send data
  $.ajax({
    url: window.ajax_add_householder_url,
    method: 'post',
    data: JSON.stringify( formData ),
    contentType: "application/json"
  })
  .done(function(res){
    if(res.error.type && !res.data.householder){
      if(res.error.type === 'VALIDATION_ERROR'){
        return bootstrapValidationHandler('new-householder-form-errors', res.error.validationErrors);
      }else{
        HouseholderEvent.emit('modal:hide');
        return DOM_CACHE.$errorModal.modal('show');
      }
    }
    HouseholderEvents.emit('updateList', res.data.householder);
    HouseholderEvents.emit('modal:hide');
  })
  .fail(function(){
    HouseholderEvent.emit('modal:hide');
    DOM_CACHE.$errorModal.modal('show');
  });

});

// bind show modal event to "new householder" button
DOM_CACHE.new_householder.button.on('click', function(){

  HouseholderEvents.emit('modal:show');

});

// bind save even to save button
DOM_CACHE.new_householder.save_button.on('click', function() {

  HouseholderEvents.emit('add');

});

/**
 * Define Visit events
 */

var VisitEvents = new EventEmitter();

VisitEvents.on('add', function(){

  var formData = form2js(DOM_CACHE.$visit_form[0]);
  // stringify data
  var jsonData = JSON.stringify(formData);
  return $.ajax({
    url: window.ajax_add_visit_url,
    method: 'post',
    data: jsonData,
    contentType: 'application/json',
  })
  .done(function(res){
    // init and show success modal and send to unit overview page
    if(res.error.type){
      if(res.error.type === 'VALIDATION_ERROR'){
        return bootstrapValidationHandler('visit-form-errors', res.error.validationErrors);
      }else{
        console.log( 'this 1 ran' );
        DOM_CACHE.$errorModal.modal('show');
      }
    }
    if(!res.data.visit){
      console.log('this ran ahain');
      return DOM_CACHE.$errorModal.modal('show');
    }
    // on success redirect to unit overview page
    window.location.replace(window.unit_overview_url);
  })
  .fail(function(jqXHR, textStatus, errorThrown){
    // show error modal
    DOM_CACHE.$errorModal.modal('show');
  });

});

// bind add event to submit button
DOM_CACHE.$visit_form_submit_button.on('click', function(){
  // console.log( form2js(DOM_CACHE.$visit_form[0]) );
  VisitEvents.emit('add');
})
