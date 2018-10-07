const expect = require('expect.js');

const UserValidator = require('../validators/UserValidator');
const Users = require('./seed/User');

describe('User Validator', () => {

  it('should pass validation', () => {

    var validation = UserValidator(Users.validUser);
    // should not return anything
    expect(validation).not.to.be.ok();

  });

  it('should not pass validation', () => {

    var validation = UserValidator(Users.incompleteUser);
    expect(validation).to.be.an('object');
    expect(validation).to.have.property('first_name');
    expect(validation).to.have.property('last_name');

  });

  it('should fail password match', () => {

    var validation = UserValidator(Users.passwordUnmatched);
    expect(validation).to.be.an('object');
    expect(validation).to.have.property('password_confirm');
    
  });

});
