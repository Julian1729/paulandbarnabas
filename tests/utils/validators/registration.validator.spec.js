const expect = require('expect.js');
const appRoot = require('app-root-path');

const {helpers} = require(`${appRoot}/utils`);
const {UserModel} = require(`${appRoot}/models`);
const {registrationValidator} = require(`${appRoot}/utils/validators`);
const registrationSeed = require(`${appRoot}/tests/seed/registration.seed`);

describe('User Validator', () => {

  it('should pass validation', () => {

    let result = registrationValidator(registrationSeed.valid);
    expect(result).to.not.exist;

  });

  it('should not pass validation', () => {

    let result = registrationValidator();
    expect(result).to.exist;
    expect(result).to.be.an('object');
    expect(result).to.have.property('first_name');
    expect(result).to.have.property('last_name');

  });

  it('should fail password match', () => {

    let result = registrationValidator(registrationSeed.passwordUnmatched);
    expect(result).to.have.property('password_confirm');

  });

  it('should fail numericality check on congregation number', () => {

    let result = registrationValidator(registrationSeed.decimalCongregationNumber);
    expect(result).to.have.property('congregation_number');

  });

});
