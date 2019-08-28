/**
 * Block Overview Page
 */
var moment = require('moment');
var timepicker = require('timepicker');
var form2js = require('../../vendor/form2js');

var $ = require('../../jquery/jquery');
var reloadPage = require('../../utils').reloadPage;
var error_modals = require('../modules/generic_modals');

var w$ = window.jQuery;

/**
* Activate "mark block as worked"
* time and date picker in modal
*/
(function(){

  var $timepickerInput = $('#block-worked-time-picker');
  var $datePickerInput = $('#block-worked-date-picker');

  $timepickerInput.timepicker({ scrollDefault: 'now' , timeFormat: 'h:i A'});

  datepicker($datePickerInput[0], {
    startDate: new Date(),
    formatter: function(el, date, instance){
      // format date Saturday March 26, 2019
      var formattedDate = dateFormatter(date);
      el.value = formattedDate;
    }
  });

  // set default date value on datepicker
  $datePickerInput.val(dateFormatter(new Date()));

  function dateFormatter(date){
    return moment(date.getTime()).format('MMMM Do, YYYY');
  }

}());

/**
 * Mark block as worked form submission
 */
(function(){

  var $submitBtn = $('#mark-block-worked-submit');

  $submitBtn.on('click', submit);

  function submit(e){
    e.preventDefault();
    var formData = form2js('mark-block-worked-form');
    var timestamp = moment(formData.date + (formData.time ? ' ' + formData.time : ''), 'MMMM Do, YYYY h:mm A' ).valueOf();
    $.ajax({
      url: localized.endpoints.mark_block_worked,
      method: 'post',
      success: reloadPage,
      error: error_modals.request_error_modal.show,
    });
  }

}());
