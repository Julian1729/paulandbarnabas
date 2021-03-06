var $ = require('jquery');

var PopulateStreetNames = function(useNames){

  $selector = this;

  $.ajax({
    url: '/ajax/territory/get-streets',
    method: 'POST',
    success: populateStreetNames
  })

  function populateStreetNames(response){
    if(response.error){
      return console.log('HANDLE THIS ERROR', response.error);
    }
    var streets = response.data;
    streets.forEach(function(street){
      var id = street._id;
      var name = street.name;
      // create option
      var option = $(document.createElement('option'));
      if(useNames === true){
        option.val(name);
      }else{
        option.val(id);
      }
      option.text(name);
      $selector.append(option);
    });

  };

}

module.exports = PopulateStreetNames;
