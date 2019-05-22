var validate = require("validate.js");
const RSVP = require('rsvp');

const UserModel = require('../../models/User');

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
