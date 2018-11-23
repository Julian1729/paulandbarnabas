var $ = require('../../jquery/jquery.js');

/**
 * Add error class and append error messages
 * @param  {[type]} validationErrors [description]
 * @return {[type]}                  [description]
 */
function standardHandler(validationErrors){
    for (var inputName in validationErrors) {
      if (validationErrors.hasOwnProperty(inputName)) {
        // find input-element container with corresponding input
        var $inputContainer = $('input[name=' + inputName + ']').parent();
        if($inputContainer.length) {
          // add error class
          $inputContainer.addClass('error');
          // insert error messages
          var $messageContainer = $inputContainer.next();//.find('.input-error-messages');
          var errorMessages = validationErrors[inputName];
          errorMessages.forEach(function(msg){
            $messageContainer.append('<p>' + msg + '</p>')
          });
        }
      }
    }
}

  /**
   * Simple validation handler. Find input element
   * and add error class, no error messages
   * @param  {object} validationErrors
   * @return {void}
   */
  function simpleHandler(validationErrors){
    for (var inputName in validationErrors) {
      if (validationErrors.hasOwnProperty(inputName)) {
        // find input-element container with corresponding input
        var $inputContainer = $('input[name=' + inputName + ']').parent();
        if($inputContainer.length) {
          // add error class
          $inputContainer.addClass('error');
        }
      }
    }
  }

  /**
   * Clear error classes from within a container,
   * usually a form element
   * @type {jQuery Object} Must be jquery object
   */
  function clearErrors($form){
    if(!$form instanceof $) $form = $($form);
    // remove error class from last submit
    $form.find('.input-element.error').each(function(){
      $(this).removeClass('error');
    });
    // remove error messages from container
    $form.find('.input-error-messages').each(function(){
      $(this).html('');
    });
  }

module.exports = {
  standardHandler,
  simpleHandler,
  clearErrors
};
