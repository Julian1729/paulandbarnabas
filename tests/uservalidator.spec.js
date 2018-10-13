const expect = require('expect.js');

const UserValidator = require('../validators/UserValidator');
const UserModel = require('../models/User');
const Utils = require('../utils/utils');
const Users = require('./seed/User');

describe('User Validator', () => {

  /**
   * Clear User collection before every test
   */
  beforeEach((done) => {
    // remove all users from db before running test
    Utils.clearCollection(UserModel).then(() => done()).catch((e) => done(e));
  });

  it('should pass validation', (done) => {

    UserValidator(Users.validUser)
      .then(() => {
        return done();
      })
      .catch((errors) => {
        expect(errors).to.have.length(0);
        return done();
      });

  });

  it('should not pass validation', (done) => {

    UserValidator(Users.incompleteUser)
      .then(() => {
        return done('should not have passed validation');
      })
      .catch((errors) => {
        expect(errors).to.be.an('object');
        expect(errors).to.have.property('first_name');
        expect(errors).to.have.property('last_name');
        return done();
      });


  });

  it('should fail password match', (done) => {

    UserValidator(Users.passwordUnmatched)
      .then(() => {
        throw new Error('should not have passed validation');
        return done();
      })
      .catch((validation) => {
        expect(validation).to.have.property('password_confirm');
        return done();
      });


  });

  it('should fail email', (done) => {

    var seedUser = new UserModel(Users.validUser);

    // save seed user
    seedUser.save()
    .then((doc) => {

      UserValidator(Users.validUser).then((data) => {
        throw new Error('should not have passed validation');
        return done();
      })
      .catch((e) => {
        //expect(e).to.be.ok();
        expect(e).to.have.property('email');
        return done();
      });

    })
    .catch((e) => {
      return done(e);
    });

  });

  it('should authenticate user', (done) => {

    var seedUser = new UserModel(Users.validUser);

    seedUser.save()
      .then(user => {
        var auth = user.authenticate(Users.validUser.password)
          .then(result => {
            expect(result).to.be.ok();
            done();
          })
          .catch(e => done(e));

      })
      .catch(e => done(e));

  });

  it('should not authenticate user', (done) => {

    var seedUser = new UserModel(Users.validUser);

    seedUser.save()
      .then(user => {
        var auth = user.authenticate(Users.validUser.password + 'random-String')
          .then(result => {
            expect(result).to.not.be.ok();
            done();
          })
          .catch(e => done(e));

      })
      .catch(e => done(e));

  });


});
