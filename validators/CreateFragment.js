/**
 * Validate fragment input from Create Fragment page
 */

const validate = require('./ValidatorBase');

var CreateFragmentConstraints = {
  'fragment.number': {
    presence: {
      allowEmpty: false
    }
  },
  'fragment.data': {
    presence: {
      allowEmpty: false
    }
  }
};

module.exports = data => validate(data, CreateFragmentConstraints);
