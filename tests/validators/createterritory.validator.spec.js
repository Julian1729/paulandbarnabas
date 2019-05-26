const {expect} = require('chai');
const appRoot = require('app-root-path');

const CTSeed = require('../seed/create-territory.seed');
const {createTerritoryValidator} = require(`${appRoot}/utils/validators`);

describe('Create Territory Validator', () => {

  it('should pass validation', () => {

    var validation = createTerritoryValidator(CTSeed.valid[0]);
    expect(validation).to.be.undefined;

  });

  it('should pass with new street', () => {

    var validation = createTerritoryValidator(CTSeed.valid[1]);
    expect(validation).to.be.undefined;

  });

  it('should require new street name', () => {

    var validation = createTerritoryValidator(CTSeed.invalid[0]);
    expect(validation).to.exist;
    expect(validation).to.have.property('new_street_name');

  });

});
