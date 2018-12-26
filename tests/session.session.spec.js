/**
 * Session Test
 */

const SessionValidator = require('../validators/SessionValidator');
const SessionSeed = require('./seed/Session');
const errors = require('../errors');
const {expect} = require('chai');


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

});
