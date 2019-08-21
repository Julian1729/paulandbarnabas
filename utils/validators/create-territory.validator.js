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
    },
    length: {
      minimum: 1,
      tooShort: 'Please add 1 or more units',
    }
  },

};

module.exports = data => {

  // object must be cloned so as not
  // to modify og object
  let c = _.cloneDeep(CreateTerritoryConstraints);
  
  // if "street" (existing street) is not provided, "new_street_name" must exist
  if(!data.street){
    c.new_street_name = {
      presence: {
        allowEmpty: false,
        message: 'Please provide a new street name',
      }
    };
  }else{
    c.street = {
      presence: {
        allowEmpty: false,
        message: 'Please select a street',
      }
    };
  }

  // only if fragment_unassigned radio button is "on"
  // does a fragment assignment not need to be chosen
  // otherwise a fragment assignment must be passed in
  if(data.fragment_unassigned !== "on"){
    c.fragment_assignment = {
      presence: {
        allowEmpty: false
      }
    }
  }

  return validate(data, c);

};
