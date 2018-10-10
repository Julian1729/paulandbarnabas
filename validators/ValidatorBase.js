var validate = require("validate.js");
const RSVP = require('rsvp');

const UserModel = require('../models/User');

// Set promise object
validate.Promise = RSVP.Promise;

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

 validate.validators.emailAlreadyExists = function(value, options, key, attributes, globalOptions){

   return new validate.Promise(function(res, rej){

     UserModel.find({email: value}).then((users) => {
       if(users.length){
         res('is already in use');
       }
       res();
     }).catch((e) => {
       rej(e);
     });

   });


 };

  /**
   * Trim value by accessing object reference and modifying the value
   */
  validate.validators.trim = (value, options, key, attributes) => {

    attributes[key] = 'nooo';
    return null;

  };


module.exports = validate;
