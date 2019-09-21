/**
 * Territory - Householder Contacted
 * es6
 */
const moment = require('moment');
const EventEmitter = require('events').EventEmitter;
const {form2js, js2form} = require('form2js');
const timepicker = require('timepicker');

// global version of jquery with bootstrap plugin enabled
const w$ = window.jQuery;

const $ = require('../../jquery/jquery');
const bootstrapValidationHandler = require('../modules/bootstrap-form-error-handler');

/**
 * Cached DOM elements
 */
const DOM_CACHE = {
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
 * Populate form if editing visit
 */
if(localized.visit){
  js2form(DOM_CACHE.$visit_form[0], {visit: localized.visit});
  // add active class to labels that are checked
  $('input[type=checkbox]').each(function() {
    $this = $(this);
    if( $this.prop('checked') === true ){
      // find closest label
      $this.closest('label.btn').addClass('active');
    }
  });
}

/**
 * Activate time and date picker
 */
DOM_CACHE.$timepicker.timepicker({ 'scrollDefault': 'now' , 'timeFormat': 'h:i A'});

datepicker('#visit-date-picker', {
  startDate: new Date(),
  formatter: (el, date, instance) => {
    // format date Saturday March 26, 2019
    let formattedDate = moment(date.getTime()).format('MMMM Do, YYYY');
    el.value = formattedDate;
  }
});

/**
 * Define Householder events
 */
let HouseholderEvents = new EventEmitter();

// show "new householder" modal event
HouseholderEvents.on('modal:show', () => {

  DOM_CACHE.new_householder.modal.modal('show');

});

// hide "new householder" modal event
HouseholderEvents.on('modal:hide', () => {

  DOM_CACHE.new_householder.modal.modal('hide');

});

HouseholderEvents.on('updateList', householder => {

  let html = '<label class="btn btn-secondary m-1 active" for="' + householder._id.toString() + '">' + householder.name + '<input type="checkbox" checked="checked" value="' + householder.name + '" name="visit.householders_contacted[]"/></label>';
  DOM_CACHE.$householder_options.append(html);

});

HouseholderEvents.on('add', () => {

  // get form data
  let formData = form2js(DOM_CACHE.new_householder.form[0]);
  // send data
  $.ajax({
    url: window.ajax_add_householder_url,
    method: 'post',
    data: JSON.stringify( formData ),
    contentType: "application/json"
  })
  .done(res => {
    //re enable save button
    DOM_CACHE.new_householder.save_button.removeAttr('disabled');
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
  .fail(() => {
    //re enable save button
    DOM_CACHE.new_householder.save_button.removeAttr('disabled');
    HouseholderEvent.emit('modal:hide');
    DOM_CACHE.$errorModal.modal('show');
  });

});

// bind show modal event to "new householder" button
DOM_CACHE.new_householder.button.on('click', () => {

  HouseholderEvents.emit('modal:show');

});

// bind save even to save button
DOM_CACHE.new_householder.save_button.on('click', () => {

  $(this).attr('disabled', true);
  HouseholderEvents.emit('add');

});

/**
 * Define Visit events
 */

let VisitEvents = new EventEmitter();

VisitEvents.on('add', () => {

  let formData = form2js(DOM_CACHE.$visit_form[0]);
  // check for visit id in hidden input
  let visitId = DOM_CACHE.$visit_form.attr('data-visit-id');
  if(visitId !== ''){
    // addVisitEndpoint += `?id=${visitId}`;
    formData.visit.id = visitId;
  }
  // stringify data
  let jsonData = JSON.stringify(formData);
  return $.ajax({
    url: window.ajax_add_visit_url,
    method: 'post',
    data: jsonData,
    contentType: 'application/json',
  })
  .done(res => {
    DOM_CACHE.$visit_form_submit_button.removeAttr('disabled');
    // init and show success modal and send to unit overview page
    if(res.error.type){
      if(res.error.type === 'VALIDATION_ERROR'){
        return bootstrapValidationHandler('visit-form-errors', res.error.validationErrors);
      }else{
        DOM_CACHE.$errorModal.modal('show');
      }
    }
    if(!res.data.visit){
      return DOM_CACHE.$errorModal.modal('show');
    }
    // on success redirect to unit overview page
    window.location.replace(window.unit_overview_url);
  })
  .fail((jqXHR, textStatus, errorThrown) => {
    // show error modal
    DOM_CACHE.$errorModal.modal('show');
  });

});

// bind add event to submit button
DOM_CACHE.$visit_form_submit_button.on('click', () => {
  $(this).attr('disabled', true);
  VisitEvents.emit('add');
})
