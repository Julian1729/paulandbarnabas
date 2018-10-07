const expect = require('expect.js');

const Users = require('./seed/User');
const User = require('../models/User');
const Utils = require('../utils/utils');

describe('Utils', () => {

  it('should delete all users in the User collection', (done) => {

    Utils.clearCollection(User).then(() => {
      User.find({}).then((users) => {
        expect(users.length).to.be(0);
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

    var data = Utils.collectFormData([
      'first_name',
      'last_name',
      'email',
      'password'
    ], mockRequest);

    expect(data).to.have.property('first_name');
    expect(data.first_name).to.be.ok();

  });

  it('should return null for first_name', () => {

    var mockRequest = {
      body: Users.incompleteUser
    };

    var data = Utils.collectFormData([
      'first_name',
      'last_name',
      'email',
      'password'
    ], mockRequest);

    expect(data).to.have.property('first_name');
    expect(data.first_name).to.be(null);

  });

});
