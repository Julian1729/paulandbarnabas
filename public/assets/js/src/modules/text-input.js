/**
 * Text Input
 * Handle label animation on focus
 */
const $ = require('jquery');
const Utils = require('../../utils.js');

// collect all input containers
var $inputContainers = $('.text-input-container');

function attachEvents(e){
  var $inputContainer = $(e); // convert to jquery object
  var $input = $($inputContainer).find('input');
  var $label = $($inputContainer).find('label');
  $input.on('focus', function(){
    floatLabel($label);
  });
  $input.on('blur', function(){
    var $this = $(this);
    // only sink label if input value is empty
    if( Utils.isEmptyString( $this.val() ) ){
      // clear value
      $this.val("");
      // put label back
      sinkLabel($label);
    }
  });
}

function floatLabel($label){
  $label.addClass('float');
}

function sinkLabel($label){
  $label.removeClass('float');
}

/**
 * Attach event handler to all existing text inputs
 */
$inputContainers.each(function(){attachEvents(this)});

module.exports = {attachEvents};
