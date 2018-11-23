var validate = require('validate.js');

validate.validators.greaterThanAttribute = function(value, options, key, attributes){
  if(typeof options !== 'string') throw new Error('must be string');
  var toCheckAgainst = attributes[options];
  if(toCheckAgainst === undefined) return;
  if(value <= toCheckAgainst){
    return 'must be greater than ' + toCheckAgainst;
  }else{
    return null;
  }
};

const GenerateUnitsConstraints = {
  block_hundred: {
    presence: {
      allowEmpty: false
    }
  },
  odd_even: {
    presence: {
      allowEmpty: false
    }
  },
  generate_from: {
    presence: {
      allowEmpty: false
    },
    numericality: {
      onlyInteger: true,
      strict: true,
    }

  },
  generate_to: {
    presence: {
      allowEmpty: false
    },
    numericality: {
      onlyInteger: true,
      strict: true,
    },
    greaterThanAttribute: 'generate_from'
  }
};

module.exports = (formValues) => {
  return validate(formValues, GenerateUnitsConstraints);
};
