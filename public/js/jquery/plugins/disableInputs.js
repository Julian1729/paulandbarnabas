var $ = require('jquery');

var DisableInputs = function(querySelector, toggle){

  var $wrapper = this;

  var $inputElements = $wrapper.find(querySelector || 'input, select, textarea');
  $inputElements.each(disable);

};

/**
 * Add disable
 * @param  {jQuery Object} $inputElement JQuery input element
 * @return {void}
 */
function disable(){
  var $this = $(this);
  $this.prop('disabled', function(i, val){
    return !val;
  });

}

module.exports = DisableInputs;
