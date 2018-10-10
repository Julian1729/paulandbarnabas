/**
 * jQuery Plugin - Ajax Form
 * Set a form to be submitted through ajax
 * @param  {[Object]} $ jQuery
 */

(function($){

  var AjaxForm = function(options, extraParams){

    var $form = this;

    var callbacks = {
      success: null,
      validation_handler: null
    };

    this.ajaxDefaults = {
      url: "#",
      method: "POST",
      success: function(data, textStatus, jqXHR){
        var validation_handler = callbacks.validation_handler || default_validation_handler;
        // call custom callback
        if( callbacks.success !== null ){
          callbacks.success(data, validation_handler, $form, textStatus, jqXHR);
        }else{
          default_success_callback(data, validation_handler, textStatus, jqXHR);
        }
      },
      fail: function(e){console.log('No fail handler...', e)}
    };

    // extract success callback
    if(options.success){
      // attach to callbacks object
      callbacks.success = options.success;
      // remove from options
      delete options.success;
    }

    // extract validation handler
    if(options.validation_handler){
      callbacks.validation_handler = options.validation_handler;
      delete options.validation_handler;
    }

    // merge defaults with options
    ajaxOptions = $.extend({}, this.ajaxDefaults, options);

    // add extra params to data
    options.data = extraParams;

    return this.each(function(){
      init($(this), ajaxOptions);
    });

  };

  /**
   * Function to be called after succesful ajax call and response
   * @param  {[Object]} data Data send back, usually a ajaxResponse object
   * @param  {[Function]} validation_handler Validation error callbacks
   * @param  {[jQuery Object]} form The form that was passed
   * @param  {[type]} textStatus
   * @param  {[type]} jqXHR
   * @return {[void]}
   */
  function default_success_callback(data, validation_handler, form, textStatus, jqXHR){
    console.log('default success handler called');
  }

  /**
   * Validation handler to be called when one is not
   * passed in with options
   * @param  {[Array]} errors Array of errors, [name: "error message"]
   * @return {void}
   */
  function default_validation_handler(errors, form){
    console.log('default validation handler called', errors);
  }

  /**
   * Initialation Function
   * @param  {[jQuery Object]} form The DOM Element passed in
   * @param  {[type]} options Filtered jQuery Ajax options
   * @return {[void]}
   */
  function init(form, options){

    form.submit(function(e){
      // stop page reload
      e.preventDefault();
      // collect data
      var formData = form2js(this, null, false);
      // merge form data to data in options
      // WARNING: formData will override duplicate keys that
      // were passed in as extra params
      options.data = $.extend({}, options.data, formData);
      $.ajax(options);
    });
  }

  $.fn.ajaxform = AjaxForm;

}(jQuery));

var signupForm = $('#signup-form').ajaxform({
  url: '/ajax/sign-up',
  method: 'POST',
  success: function(data, validation_handler, form){

    // FIXME: Not production ready
    if(data.status === 0){
      return console.log('Error', data.message);
    }

    if(data.validation !== null){
      return validation_handler(data.validation, form);
    }

    if(data.status === 1){
      console.log('user saved');
    }

  }
});
