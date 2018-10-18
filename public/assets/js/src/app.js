var $ = require('../jquery/jquery.js');

var signupForm = $('#signup-form').ajaxform({
url: '/ajax/sign-up',
method: 'POST',
success: function(response, validation_handler, form){

  // FIXME: Not production ready (setup validation handler, and error)
  if(response.status === 0){
    return console.log('Error', response.message);
  }

  if(response.validation !== null){
    return validation_handler(response.validation, form);
  }

  if(response.status === 1 && response.data.redirect){
    pb.redirect(response.data.redirect);
  }

}
});

var loginForm = $('#login-form').ajaxform({
url: '/ajax/login',
method: 'POST',
success: function(response, validation_handler, form, textStatus){

  // FIXME: Not production ready (setup validation handler, and error)
  if(response.status === 0){
    return console.log('Error', response.message);
  }

  if(response.validation){
    return validation_handler(response.validation, form);
  }

  if(response.status === 1 && response.data.redirect){
    pb.redirect(response.data.redirect);
  }

}
});
