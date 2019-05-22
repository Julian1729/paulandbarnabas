/**
 * Utility Functions
 */

var redirect = function(to){
  window.location.replace(to);
};

var isEmptyString = function(string){
  string = string + ""; //cast to string
  return (string.length === 0 || !string.trim());
};

var reloadPage = function(){
  window.location.reload(false);
};

module.exports = {
  redirect: redirect,
  isEmptyString: isEmptyString,
  reloadPage: reloadPage,
};
