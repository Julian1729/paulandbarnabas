var $ = require('../../jquery/jquery.js');
var Utils = require('../../utils.js');
const inputs = require('../modules/text-input.js');

var signupForm = $('#signup-form').ajaxform({
url: '/ajax/sign-up',
method: 'POST',
success: function(response, validation_handler, form){

  console.log(response);

}
});
