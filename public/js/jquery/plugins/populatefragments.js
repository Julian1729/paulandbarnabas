var $ = require('jquery');

var PopulateFragments = function(){

  var $selector = this;

  $.ajax({
    url: '/ajax/territory/get-fragments',
    method: 'GET',
    success: populateFragments
  })

  function populateFragments (response){
    if(response.error){
      return console.log('HANDLE THIS ERROR');
    }
    var fragments = response.data;
    fragments.forEach(function(fragment){
      var number = fragment.number;
      // create option
      var option = $(document.createElement('option')).val(number).text(number);
      $selector.append(option);
    });
  }

};

module.exports = PopulateFragments;
