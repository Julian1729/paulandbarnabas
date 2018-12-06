var validate = require('validate.js');
const _ = require('lodash');

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

var GenerateUnitsConstraints = {
  block_hundred: {
    presence: {
      allowEmpty: false
    },
    numericality: {
      onlyInteger: true,
      strict: true
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
    var c = _.cloneDeep(GenerateUnitsConstraints);
  // validate generation values based on odd or even
  switch (formValues.odd_even) {
    case "odd":
      // validate generate to and from values
      c.generate_to.numericality.odd = true;
      c.generate_from.numericality.odd = true;
      break;
    case "even":
      // validate generate to and from values
      c.generate_to.numericality.even = true;
      c.generate_from.numericality.even = true;
      break;
  }
  return validate(formValues, c);
};
