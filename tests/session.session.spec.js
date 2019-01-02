/**
 * Session Test
 */
const {expect} = require('chai');

const SessionValidator = require('../validators/SessionValidator');
const SessionSeed = require('./seed/Session');
const errors = require('../errors');
const Session = require('../session/session');


describe('Session', () => {

  it('should validate session', () => {

    var validation = SessionValidator(SessionSeed.valid);
    expect(validation).to.be.undefined;

  });

  it('should not validate session', () => {

    try {
      var validation = SessionValidator(SessionSeed.invalid);
      throw new Error('Should have thrown SessionUnauthenticated');
    } catch (e) {
        expect(e instanceof errors.SessionUnauthenticated).to.be.true;
    }

  });

  it('should return a object with user credentials', () => {
    var credentials = Session.pickUserCredentials(SessionSeed.valid);
    expect(credentials).to.exist;
    expect(credentials).to.include.all.keys('first_name', 'last_name', 'user_id', 'congregation', 'isAdmin');
  });

});
