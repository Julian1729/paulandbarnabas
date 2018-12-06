const {expect} = require('chai');

const CTSeed = require('./seed/CreateTerritory');
const validator = require('../validators/CreateTerritory');

describe('Create Territory Validator', () => {

  it('should pass validation', () => {

    var validation = validator(CTSeed.valid[0]);
    expect(validation).to.be.undefined;

  });

  it('should pass with new street', () => {

    var validation = validator(CTSeed.valid[1]);
    expect(validation).to.be.undefined;

  });

  it('should require new street name', () => {

    var validation = validator(CTSeed.invalid[0]);
    expect(validation).to.exist;
    expect(validation).to.have.property('new_street_name');

  });

});
