const validate = require('validate.js');

const NewHouseholderConstraints = {

  'householder.name': {
    presence: {
      allowEmpty: false,
      message: 'Please add the householder\'s name'
    },
  },

  'householder.gender': {
    presence: {
      allowEmpty: false,
      message: 'Please specify the householder\'s gender'
    },
  },

};

module.exports = function(formData){ return validate(formData, NewHouseholderConstraints); };
