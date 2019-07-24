const validate = require('./base.js');

const NewHouseholderConstraints = {

  'name': {
    presence: {
      allowEmpty: false,
      message: 'Please add the householder\'s name'
    },
  },

  'gender': {
    presence: {
      allowEmpty: false,
      message: 'Please specify the householder\'s gender'
    },
  },

};

module.exports = function(formData){ return validate(formData, NewHouseholderConstraints); };
