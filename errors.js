/**
 * Custom errors
 */

/**
 * Used in test cases to distinguish a manually thrown
 * error from an organic one.
 * @extends Error
 */
class TestFailed extends Error {

 constructor(message){
   super(message);
   this.name = 'TestFailed';
   this.message = message;
 }

}

/**
 * User not found in database
 * @extends Error
 */
class UserNotFound extends Error {

 constructor(message){
   super(message);
   this.name = 'UserNotFound';
   this.message = message;
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
    this.message = message;
  }
}

class EmailAlreadyExists extends Error {
  constructor(message, email){
    super();
    this.name = 'EmailAlreadyExists()';
    this.email = email;
    this.message = message;
  }
}

class CongregationNotFound extends Error {

  constructor(message){
    super();
    this.name = 'CongregationNotFound';
    this.message = message;
  }

}

class CongregationNumberAlreadyExists extends Error {

  constructor(number){
    super();
    this.name = 'CongregationNumberAlreadyExists';
    this.message = `Congregation number #${number} has already been registered`;
    this.number = number;
  }

}

class NonExistentController extends Error {

  constructor(message){
    super();
    this.name = 'NonExistentController';
    this.message = message;
  }

}

class NonExistentAction extends Error {

  constructor(message){
    super();
    this.name = 'NonExistentAction';
    this.message = message;
  }

}

/**
 * Session
 */
class SessionUninitialized extends Error {

  constructor(message){
    super();
    this.name = 'SessionUninitialized';
    this.message = message;
  }

}

class SessionUnauthenticated extends Error {

  constructor(message){
    super();
    this.name = 'SessionUnauthenticated';
    this.message = message;
  }

}

/**
 * Model Method Errors
 */

class StreetNotFound extends Error {
  constructor(street){
    super();
    this.name = 'StreetNotFound';
    this.street = street;
  }
}

class StreetAlreadyExists extends Error {
  constructor(street){
    super();
    this.name = 'StreetAlreadyExists';
    this.street = street;
  }
}

class TerritoryNotFound extends Error {
  constructor(message){
    super();
    this.name = 'TerritoryNotFound';
    this.message = message;
  }
}

class FragmentNotFound extends Error {
  constructor(message){
    super();
    this.name = 'FragmentNotFound';
    this.message = message;
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

class HundredNotFound extends Error {
  constructor(hundred){
    super();
    this.name = 'HundredNotFound';
    this.hundred = hundred;
  }
}

class HundredAlreadyExists extends Error {
  constructor(hundred){
    super();
    this.name = 'HundredAlreadyExists';
    this.hundred = hundred;
  }
}

class UnitNotFound extends Error {
  constructor(number){
    super();
    this.name = 'UnitNotFound';
    this.number = number;
  }
}

class UnitsAlreadyExist extends Error {
  constructor(duplicateNumbers){
    super();
    this.name = 'UnitsAlreadyExist';
    this.duplicateNumbers = duplicateNumbers;
  }
}

class SubunitNotFound extends Error {
  constructor(subunit_name){
    super();
    this.name = 'SubunitNotFound';
    this.subunit_name = subunit_name;
  }
}


 module.exports = {
   TestFailed,
   UserNotFound,
   FormValidationError,
   InvalidCredentials,
   EmailAlreadyExists,
   CongregationNotFound,
   CongregationNumberAlreadyExists,
   NonExistentController,
   NonExistentAction,
   StreetNotFound,
   StreetAlreadyExists,
   TerritoryNotFound,
   FragmentNotFound,
   SessionUninitialized,
   SessionUnauthenticated,
   FragmentNumberAlreadyExists,
   BlocksAlreadyAssignedToFragment,
   HundredNotFound,
   HundredAlreadyExists,
   UnitNotFound,
   UnitsAlreadyExist,
   SubunitNotFound
 };
