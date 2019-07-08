const {expect} = require('chai');
const {ObjectId} = require('mongodb');
const appRoot = require('app-root-path');

const {saveFragmentValidator} = require(`${appRoot}/utils/validators`);

describe('Save/Fragment Validator', () => {

  it('should pass validation wo/ assignment', () => {

    let seedData = {
      fragment: {
        number: 2,
        blocks: [new ObjectId(), new ObjectId()],
        assignment: null
      }
    };

    let result = saveFragmentValidator(seedData);
    expect(result).to.be.undefined;

  });

  it('should pass validation w/ assignment', () => {

    let seedData = {
      fragment: {
        number: 2,
        blocks: [new ObjectId(), new ObjectId()],
        assignment: new ObjectId()
      }
    };

    let result = saveFragmentValidator(seedData);
    expect(result).to.be.undefined;

  });

});
