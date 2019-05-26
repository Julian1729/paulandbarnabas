/**
 * This is a front end code
 * test and should not be located
 * in this directory.
 */

const {expect} = require('chai');
const appRoot = require('app-root-path');

const GUSeed = require(`${appRoot}/tests/seed/generate-units.seed`);
const generateUnitsValidator = require(`${appRoot}/public/js/src/validators/GenerateUnits.js`);

describe('Generate Units Validator', () => {

  it('should pass validation', () => {

    var validation = generateUnitsValidator(GUSeed.valid[0]);
    expect(validation).to.be.undefined;

  });

  it('should not pass valdation', () => {
    var validation = generateUnitsValidator(GUSeed.invalid[0]);
    expect(validation).to.exist;
  });

  it('should return required message', () => {
    var validation = generateUnitsValidator(GUSeed.invalid[0]);
    expect(validation).to.have.property('block_hundred');
    expect(validation.block_hundred[0]).to.exist;
  });

  it('should fail numeric check', () => {
    var validation = generateUnitsValidator(GUSeed.invalid[1]);
    expect(validation).to.exist;
    expect(validation.generate_from[0]).to.exist;
  });

  it('should fail greater than check', () => {
    var validation = generateUnitsValidator(GUSeed.invalid[2]);
    expect(validation).to.exist;
    expect(validation).to.have.property('generate_to');
  });

  it('should fail odd even check on generate_to', () => {
    var validation = generateUnitsValidator(GUSeed.invalid[3]);
    expect(validation).to.exist;
    expect(validation).to.have.property('generate_to');
  });

});
