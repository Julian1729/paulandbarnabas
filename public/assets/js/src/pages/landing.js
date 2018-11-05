var $ = require('../../jquery/jquery.js');
var Utils = require('../../utils.js');
const inputs = require('../modules/text-input.js');

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
