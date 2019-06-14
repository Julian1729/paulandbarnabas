const expect = require('expect.js');
const appRoot = require('app-root-path');

const {loginValidator} = require(`${appRoot}/utils/validators`);
const Logins = require(`${appRoot}/tests/seed/logins.seed`);

describe('Login Validation', () => {

  it('should pass validation', () => {

    var loginInfo = Logins.validLogin;

    var validation = loginValidator(loginInfo);
    expect(validation).to.not.be.ok();

  });

  it('should not accept empty email validation', () => {

    var loginInfo = Logins.invalidLogins.emptyEmail;
    var validation = loginValidator(loginInfo);
    expect(validation).to.be.ok();
    expect(validation).to.have.property('email');

  });

  it('should not accept empty email validation', () => {

    var loginInfo = Logins.invalidLogins.emptyPassword;
    var validation = loginValidator(loginInfo);
    expect(validation).to.be.ok();
    expect(validation).to.have.property('password');

  });




});
