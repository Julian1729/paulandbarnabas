/**
 * Text Input
 * Handle label animation on focus
 */
const $ = require('jquery');

// collect all input containers
var $inputContainers = $('.text-input-container');

function animateLabel(inputContainer){
  var $inputContainer = $(inputContainer); // convert to jquery object
  var $input = $($inputContainer).find('input');
  var $label = $($inputContainer).find('label');
  $input.focus(function(){
    floatLabel($label);
  });
  $input.blur(function(){
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

$inputContainers.each(function(){animateLabel(this)});
