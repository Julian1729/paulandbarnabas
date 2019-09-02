/**
 * Congregation Registration form
 * validator. Implement user registration
 * validator for user section.
 */
const validate = require('./base');

const ISO6391 = require('iso-639-1');

validate.validators.isValidLanguage = function(value, options, key, attributes) {

  if(ISO6391.getCode(value) === ''){
    return 'is not a recognized language';
  }

};

const CongregationRegistrationConstraints = {

  // Congregation
  'congregation.name' : {
    presence: {
      allowEmpty: false,
    },
  },

  'congregation.circuit' : {
    presence: {
      allowEmpty: false,
    },
  },

  'congregation.city' : {
    presence: {
      allowEmpty: false,
    },
  },

  'congregation.country' : {
    presence: {
      allowEmpty: false,
    },
  },

  'congregation.number' : {
    presence: {
      allowEmpty: false,
    },
    numericality: {
      onlyInteger: true,
    },
  },

  'congregation.language' : {
    presence: {
      allowEmpty: false,
    },
    isValidLanguage: true,
  },

  'congregation.referall' : {
    presence: {
      allowEmpty: true,
    },
  },

  // Admin User
  'user.first_name': {
    presence: {
      allowEmpty: false,
    },
    length: {
      minimum: 1,
    },
  },

  'user.last_name': {
    presence: {
      allowEmpty: false,
    },
  },

  'user.email': {
    presence: {
      allowEmpty: false,
    },
    email: {
      message: 'Please provide a valid email'
    }
  },

  'user.email_confirm': {
    presence: {
      allowEmpty: false,
    },
    equality: {
      attribute: 'user.email',
    },
  },

  'user.phone_number': {
    presence: {
      allowEmpty: false,
    },
    format: {
      pattern: /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
    },
  },

  'user.password': {
    presence: {
      allowEmpty: false,
    },
    length: {
      minimum: 8,
    },
  },

  'user.password_confirm': {
    presence: {
      allowEmpty: false,
    },
    equality: {
      attribute: 'user.password',
      message: 'Passwords do not match',
    },
  },

  'user.position' : {
    presence: {
      allowEmpty: false,
    },
  },

  // Territory
  'territory.description' : {
    presence: {
      allowEmpty: false,
    },
  },

};

module.exports = formData => validate(formData, CongregationRegistrationConstraints);
