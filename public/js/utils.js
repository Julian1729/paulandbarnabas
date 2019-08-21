/**
 * Utility Functions
 */

exports.redirect = function(to){
  window.location.replace(to);
};

exports.isEmptyString = function(string){
  string = string + ""; //cast to string
  return (string.length === 0 || !string.trim());
};

exports.reloadPage = function(){
  window.location.reload(false);
};
