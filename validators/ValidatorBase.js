var validate = require("validate.js");

// Set custom message format
// validate.formatters.pb = (errors) => {
//   return errors.map((error) => {
//     return 'the message';
//   });
// };

validate.validators.presence.message = 'is required';

/**
 * ----------
 * Custom Validators
 * ----------
 */

 /**
  * Compare two attributes for strict equality
  * @param  {Object} options {equal: attribute key to compare to, [,message]}
  */
 validate.validators.compare = function(value, options, key, attributes, globalOptions){
   // empty values do not fail, assuming 'presence' was checked and has failed
   if(!value || value === '') return;
   // if no 'equal' option return
   var compareTo = null;
   if(options.equal){
     compareTo = options.equal
   }else{
     return;
   }

   // contruct message
   var message = options.message || this.message || ('does not match ' + validate.prettify(options.equal));

   // check that attribute exists
   var stringToCompare = null;
   if (attributes[compareTo]){
     stringToCompare = attributes[compareTo]
   }else{
     return message;
   }

   if(stringToCompare !== value){
     return message;
   }

   return;

 };

  /**
   * Trim value by accessing object reference and modifying the value
   */
  validate.validators.trim = (value, options, key, attributes) => {

    attributes[key] = 'nooo';
    return null;

  };


module.exports = (validatee, contraints, options) => validate(validatee, contraints, options);
