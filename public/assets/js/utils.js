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

module.exports = {
  redirect: redirect,
  isEmptyString: isEmptyString
};
