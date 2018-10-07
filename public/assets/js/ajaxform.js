/**
 * jQuery Plugin - Ajax Form
 * Set a form to be submitted through ajax
 * @param  {[Object]} g Explicitly set Window object
 */

(function($){

  var AjaxForm = function(options, extraParams){

    this.defaults = {
      url: "#",
      method: "POST",
      success: function(e){console.log('No success handler...', e);},
      fail: function(e){console.log('No fail handler...', e)}
    };

    // merge defaults with options
    options = $.extend({}, this.defaults, options);

    // add extra params to data
    options.data = extraParams;

    return this.each(function(){
      init($(this), options);
    });

  };


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
  method: 'POST'
});
