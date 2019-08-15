const $ = require('../../jquery/jquery');

module.exports = function(errorContainerId, validationErrors){

  var $errorContainer = $('#' + errorContainerId);
  if(!$errorContainer.length) throw new Error('error container w/ id ' + errorContainerId + ' not found');
  // clear container
  $errorContainer.html('');
  for (var name in validationErrors) {
    if (validationErrors.hasOwnProperty(name)) {
      var errorMessages = validationErrors[name];
      errorMessages.forEach(function(msg){
        $errorContainer.append('<div class="alert alert-danger" role="alert">' + msg + '</div>')
      });
    }
  }
  // scroll to top
  $("html, body").animate({ scrollTop: 0 }, "slow");

};
