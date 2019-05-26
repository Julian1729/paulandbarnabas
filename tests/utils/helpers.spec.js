const {expect} = require('chai');
const appRoot = require('app-root-path');

const config = require(`${appRoot}/config/config`);
const Users = require('../seed/user.seed');
const {UserModel} = require(`${appRoot}/models`);
const {helpers} = require(`${appRoot}/utils`);

describe('utils/helpers', () => {

  it('should expose functions', () => {
    expect(helpers.isOdd).to.exist;
    expect(helpers.collectFormData).to.exist;
    expect(helpers.bcryptPassword).to.exist;
  });

  it('should delete all users in the User collection', (done) => {

    helpers.clearCollection(UserModel).then(() => {
      UserModel.find({}).then((users) => {
        expect(users.length).to.equal(0);
        done();
      }).catch((e) => {
        done(e);
      });
    });

  });

  it('should collect entire form data', () => {

    var mockRequest = {
      body: Users.validUser
    };

    var data = helpers.collectFormData([
      'first_name',
      'last_name',
      'email',
      'password'
    ], mockRequest);

    expect(data).to.have.property('first_name');
    expect(data.first_name).to.exist;

  });

  it('should return null for first_name', () => {

    var mockRequest = {
      body: Users.incompleteUser
    };

    var data = helpers.collectFormData([
      'first_name',
      'last_name',
      'email',
      'password'
    ], mockRequest);

    expect(data).to.have.property('first_name');
    expect(data.first_name).to.not.exist;

  });

  it('should convert hyphenated string to camel case', () => {

    var string = 'this-is-test-string';
    var camelCase = helpers.camelCase(string);
    expect(camelCase).to.equal('thisIsTestString');

  });

  it('should convert spaced string to camel case', () => {

    var string = 'this is test string';
    var camelCase = helpers.camelCase(string, ' ');
    expect(camelCase).to.equal('thisIsTestString');

  });

  it('should convert to pascual case', () => {

    var string = 'this-is-test-string';
    var PascualCase = helpers.pascualCase(string);
    expect(PascualCase).to.equal('ThisIsTestString');

  });

  it('should return true for odd number', () => {

    var res = helpers.isOdd(7);
    expect(res).to.be.true;

  });

  it('should return false for even number', () => {

      var res = helpers.isOdd(2);
      expect(res).to.be.false;

  });

});
