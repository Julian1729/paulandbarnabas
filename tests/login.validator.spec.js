const expect = require('expect.js');

const LoginValidator = require('../validators/LoginValidator');
const Logins = require('./seed/Logins');

describe('Login Validation', () => {

  it('should pass validation', () => {

    var loginInfo = Logins.validLogin;

    var validation = LoginValidator(loginInfo);
    expect(validation).to.not.be.ok();

  });

  it('should not accept empty email validation', () => {

    var loginInfo = Logins.invalidLogins.emptyEmail;
    var validation = LoginValidator(loginInfo);
    expect(validation).to.be.ok();
    expect(validation).to.have.property('email');

  });

  it('should not accept empty email validation', () => {

    var loginInfo = Logins.invalidLogins.emptyPassword;
    var validation = LoginValidator(loginInfo);
    expect(validation).to.be.ok();
    expect(validation).to.have.property('password');

  });




});
