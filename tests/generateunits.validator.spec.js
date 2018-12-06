const {expect} = require('chai');

const Validator = require('../public/assets/js/src/validators/GenerateUnits');
const GUSeed = require('./seed/GenerateUnits');

describe('Generate Units Validator', () => {

  it('should pass validation', () => {

    var validation = Validator(GUSeed.valid[0]);
    expect(validation).to.be.undefined;

  });

  it('should not pass valdation', () => {
    var validation = Validator(GUSeed.invalid[0]);
    expect(validation).to.exist;
  });

  it('should return required message', () => {
    var validation = Validator(GUSeed.invalid[0]);
    expect(validation).to.have.property('block_hundred');
    expect(validation.block_hundred[0]).to.exist;
  });

  it('should fail numeric check', () => {
    var validation = Validator(GUSeed.invalid[1]);
    expect(validation).to.exist;
    expect(validation.generate_from[0]).to.exist;
  });

  it('should fail greater than check', () => {
    var validation = Validator(GUSeed.invalid[2]);
    expect(validation).to.exist;
    expect(validation).to.have.property('generate_to');
  });

});
