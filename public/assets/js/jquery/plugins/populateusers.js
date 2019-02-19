/**
 * Populate Select elements users by congregation
 */
var $ = require('jquery');

var PopulateUsers = function(){

  var $selector = this;

  $.ajax({
    url: '/ajax/user/get-list',
    method: 'GET',
    success: populateUsers,
    error: function(){
      window.GENERIC_MODALS.request_error_modal.show();
    }
  })

  function populateUsers (response){
    var users = response.data;
    users.forEach(function(user){
      // create option
      var option = $(document.createElement('option'))
        .val(user._id)
        .text(user.first_name + " " + user.last_name);
      $selector.append(option);
    });
  }

};

module.exports = PopulateUsers;
