/**
 * Block Overview Page
 */
const _ = require('lodash');
const moment = require('moment');
const timepicker = require('timepicker');
const form2js = require('../../vendor/form2js');

const $ = require('../../jquery/jquery');
const reloadPage = require('../../utils').reloadPage;
const error_modals = require('../modules/generic_modals');

const w$ = window.jQuery;

const DOM_CACHE = {
  modals: {
    error: w$('#bootstrap-error-modal'),
  },
};

/**
* Activate "mark block as worked"
* time and date picker in modal
*/
(() => {

  let dateFormatter = (date) => {
    return moment(date.getTime()).format('MMMM Do, YYYY');
  };

  let $timepickerInput = $('#block-worked-time-picker');
  let $datePickerInput = $('#block-worked-date-picker');

  $timepickerInput.timepicker({ scrollDefault: 'now' , timeFormat: 'h:i A'});

  datepicker($datePickerInput[0], {
    startDate: new Date(),
    formatter: function(el, date, instance){
      // format date Saturday March 26, 2019
      let formattedDate = dateFormatter(date);
      el.value = formattedDate;
    }
  });

  // set default date value on datepicker
  $datePickerInput.val(dateFormatter(new Date()));

})();

/**
 * Mark block as worked form submission
 */
(() => {

  let $submitBtn = $('#mark-block-worked-submit');

  let submit = (e) => {
    e.preventDefault();
    $submitBtn.attr('disabled', true);
    let formData = form2js('mark-block-worked-form');
    // default time to
    let timestamp = moment(`${formData.date} ${formData.time || moment().format('hh:mm A')}`, 'MMMM Do, YYYY hh:mm A' ).valueOf();
    let markBlockWorkedEndpoint = localized.endpoints.mark_block_worked.replace('TIMEHERE', timestamp);
    $.ajax({
      url: markBlockWorkedEndpoint,
      method: 'post',
      success: reloadPage,
      error: error_modals.request_error_modal.show,
    });
  };

  $submitBtn.on('click', submit);

})();

/**
 * Add tag submission
 */
(() => {

  let $submitBtn = $('#add-tag-submit-btn');

  let submit = (e) => {

    e.preventDefault();
    $submitBtn.attr('disabled', true);

    let $input = $('#add-tag-input')
    let newTag = $input.val();
    let $errorContainer = $('#add-tag-errors');

    // clear out errors
    $errorContainer.html('');

    if(_.isEmpty(newTag)){
      return $errorContainer.append('<div class="alert alert-danger" role="alert">Please enter a valid tag</div>');
    }

    // WARNING: this is very hacky. the url passed in from the
    // backend has "TAGHERE" hardcoded in as a query param, the now
    // known tag can then replace that string, while having the url
    // accurately constructed in the backend.
    let endpoint = localized.endpoints.add_tag.replace(/TAGHERE/, newTag);
    // send ajax request
    $.ajax({
      url: endpoint,
      type: 'POST',
    })
    .done(function(r){
      $input.val('');
      // FIXME: bad UX, should close modal and add to to list w js
      reloadPage();
    })
    .fail(function(){
      DOM_CACHE.modals.error.modal('show');
    });

  };

  $submitBtn.on('click', submit);

})();
