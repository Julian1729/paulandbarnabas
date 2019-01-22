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

class NonExistentController extends Error {

  constructor(message){
    super();
    this.name = 'NonExistentController';
    this.msg = message;
  }

}

class NonExistentAction extends Error {

  constructor(message){
    super();
    this.name = 'NonExistentAction';
    this.msg = message;
  }

}

/**
 * Session
 */
class SessionUninitialized extends Error {

  constructor(message){
    super();
    this.name = 'SessionUninitialized';
    this.msg = message;
  }

}

class SessionUnauthenticated extends Error {

  constructor(message){
    super();
    this.name = 'SessionUnauthenticated';
    this.msg = message;
  }

}

/**
 * Model Method Errors
 */

class StreetNotFound extends Error {
  constructor(message){
    super();
    this.name = 'StreetNotFound';
    this.msg = message;
  }
}

class StreetAlreadyExists extends Error {
  constructor(streetName){
    super();
    this.name = 'StreetAlreadyExists';
    this.streetName = streetName;
  }
}

class TerritoryNotFound extends Error {
  constructor(message){
    super();
    this.name = 'TerritoryNotFound';
    this.msg = message;
  }
}

class FragmentNotFound extends Error {
  constructor(message){
    super();
    this.name = 'FragmentNotFound';
    this.msg = message;
  }
}

class FragmentNumberAlreadyExists extends Error {
  constructor(number){
    super();
    this.name = 'FragmentNumberAlreadyExists';
    this.number = number;
  }
}

class BlocksAlreadyAssignedToFragment extends Error {
  constructor(blocks){
    super();
    this.name = 'BlocksAlreadyAssignedToFragment';
    this.blocks = blocks;
  }
}

 module.exports = {
   UserNotFound,
   FormValidationError,
   InvalidCredentials,
   CongregationNotFound,
   NonExistentController,
   NonExistentAction,
   StreetNotFound,
   StreetAlreadyExists,
   TerritoryNotFound,
   FragmentNotFound,
   SessionUninitialized,
   SessionUnauthenticated,
   FragmentNumberAlreadyExists,
   BlocksAlreadyAssignedToFragment
 };
