var validate = require('./ValidatorBase');

const UserConstraints = {
  'first_name': {
    presence: {
      message: 'Please provide a first name'
    },
    length: {
      minimum: 1,
      message: 'First name must contain at least one character'
    }
  },
  'last_name': {
    presence: {
      message: 'Please provide a last name'
    },
    length: {
      minimum: 1,
      message: 'Last name must contain at least one character'
    }
  },
  'email': {
    // OPTIMIZE: custom validator to check if
    // email has already been registered
    presence: {
      message: 'Please provide an email'
    },
    email: {
      message: 'Please provide a valid email'
    },
    emailAlreadyExists: {
      message: 'Email is already in use'
    }
  },
  'password': {
    presence: {
      message: 'Please provide a password'
    },
    length: {
      minimum: 8,
      message: 'Password must be at least 8 characters long'
    }
  },
  'password_confirm': {
    presence: {
      message: 'Please confirm your password'
    },
    compare: {
      equal: 'password',
      message: 'Passwords do not match'
    }
  }
};

module.exports = (user) => {
  return validate.async(user, UserConstraints, {fullMessages: false});
};
