var validate = require('./base');

const SignUpConstraints = {
  'first_name': {
    presence: {
      message: 'Please provide a first name',
      allowEmpty: false
    },
    length: {
      minimum: 1,
      message: 'First name must contain at least one character'
    }
  },
  'last_name': {
    presence: {
      message: 'Please provide a last name',
      allowEmpty: false
    }
  },
  'congregation_number': {
    presence: {
      message: 'Please provide your congregation number',
      allowEmpty: false
    },
    numericality: {
      onlyInteger: true,
      message: 'Please provide a valid congregation number'
    }
  },
  'email': {
    presence: {
      message: 'Please provide an email',
      allowEmpty: false
    },
    email: {
      message: 'Please provide a valid email'
    }
  },
  'email_confirm': {
    presence: {
      message: 'Please confirm your email',
      allowEmpty: false
    },
    equality: {
      attribute: 'email',
      message: 'Emails do not match'
    }
  },
  'phone_number': {
    presence: {
      message: 'Please provide your phone number',
      allowEmpty: false
    },
    format: {
      pattern: /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
      message: 'Please provide a valid phone number'
    }
  },
  'password': {
    presence: {
      message: 'Please provide a password',
      allowEmpty: false
    },
    length: {
      minimum: 8,
      message: 'Password must be at least 8 characters long'
    }
  },
  'password_confirm': {
    presence: {
      message: 'Please confirm your password',
      allowEmpty: false
    },
    equality: {
      attribute: 'password',
      message: 'Passwords do not match'
    }
  }
};

module.exports = (user) => {
  return validate(user, SignUpConstraints, {fullMessages: false});
};
