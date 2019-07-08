/**
 * Validate form data from Create Territory page
 *
 * First, validate all basic data.
 * Second, discern whether new street is being
 * created or existing street will be used, and
 * validate accordingly.
 */
const _ = require('lodash');

const validate = require('./base');

var CreateTerritoryConstraints = {
  block_hundred: {
    presence: {
      allowEmpty: false
    }
  },

  odd_even: {
    presence: {
      allowEmpty: false
    },
    inclusion: {
      within: ['odd', 'even'],
      message: 'Please specify whether this block is odd, or even'
    }
  },

  units: {
    presence: {
      allowEmpty: false
    }
  }
};

module.exports = data => {
  // object must be cloned so as not
  // to modify og object
  var c = _.cloneDeep(CreateTerritoryConstraints);
  // if "street" is null, "new_street_name" must exist
  if(data.street === null){
    c.new_street_name = {
      presence: {
        allowEmpty: false
      }
    };
  }else{
    c.street = {
      presence: {
        allowEmpty: false
      }
    };
  }

  // if "leave fragment unassigned" is on,
  // then a fragement holder must be chosen
  if(data.fragment_unassigned !== "on"){
    c.fragment_assignment = {
      presence: {
        allowEmpty: false
      }
    }
  }

  return validate(data, c);
};
