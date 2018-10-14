var validate = require('./ValidatorBase');

const LoginConstraints = {
  email: {
    presence: {
      message: 'Please enter your email',
      allowEmpty: false
    }
  },
  password: {
    presence: {
      message: 'Please enter your password',
      allowEmpty: false
    }
  }
};

module.exports = (user) => {
  return validate(user, LoginConstraints, {fullMessages: false});
};