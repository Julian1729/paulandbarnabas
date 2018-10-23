var $ = require('../jquery/jquery.js');
var Utils = require('../utils.js');

var signupForm = $('#signup-form').ajaxform({
url: '/ajax/sign-up',
method: 'POST',
success: function(response, validation_handler, form){

  console.log(response);

}
});

var loginForm = $('#login-form').ajaxform({
url: '/ajax/login',
method: 'POST',
success: function(response, validation_handler, form, textStatus){

  console.log(response);

  if(response.error){
    console.log('error', response.error);
  }else if(response.data.redirect){
    Utils.redirect(response.data.redirect);
  }

}
});
