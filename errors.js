/**
 * Custom errors
 */


/**
 * User not found in database
 * @extends Error
 */
class UserNotFound extends Error {

 constructor(message){
   super(message);
   this.name = 'UserNotFound';
   this.msg = message;
 }

}

/**
 * Requested form submission does not meet required expectations
 * @extends Error
 */
class FormValidationError extends Error {

  constructor(validationErrors){
    super();
    this.name = 'FormValidationError';
    this.validationErrors = validationErrors;
  }

}

/**
 * Account credentials could not be authenticated
 * @extends Error
 */
class InvalidCredentials extends Error {
  constructor(message){
    super();
    this.name = 'InvalidCredentials';
    this.msg = message;
  }
}

class CongregationNotFound extends Error {

  constructor(message){
    super();
    this.name = 'CongregationNotFound';
    this.msg = message;
  }

}

 module.exports = {
   UserNotFound,
   FormValidationError,
   InvalidCredentials,
   CongregationNotFound
 };
