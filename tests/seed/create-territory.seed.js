const {ObjectId} = require('mongodb');

const valid = [

  {
    block_hundred: 4500,
    odd_even: 'even',
    units: [
      {
        number: 4500,
        subunits: ["Apt 1", "Apt 2"]
      },
      {
        number: 4502,
        subunits: ["Floor 1", "Floor 2"]
      }
    ],
    street: new ObjectId(),
    new_street_name: null,
    fragment_unassigned: "on",
    fragment_assignment: null
  },

  {
    block_hundred: 4500,
    odd_even: 'even',
    units: [
      {
        number: 4500,
        subunits: ["Apt 1", "Apt 2"]
      },
      {
        number: 4502,
        subunits: ["Floor 1", "Floor 2"]
      }
    ],
    street: null,
    new_street_name: "Oakland",
    fragment_unassigned: null,
    fragment_assignment: new ObjectId()
  }

];

var invalid = [

  /**
   * "street" must be defined because
   * "new_street_name" isn't defined
   */
  {
    block_hundred: 4500,
    odd_even: 'even',
    units: [
      {
        number: 4500,
        subunits: ["Apt 1", "Apt 2"]
      },
      {
        number: 4502,
        subunits: ["Floor 1", "Floor 2"]
      }
    ],
    street: null,
    new_street_name: null,
    fragment_unassigned: null,
    fragment_assignment: new ObjectId()
  }

];

module.exports = {
  valid,
  invalid
};
