const expect = require('expect.js');
const Utils = require('../utils/utils');
const seed = require('./seed/Congregation');
const Congregation = require('../models/Congregation');


describe('Congregation Model', () => {

  /**
   * Clear User collection before every test
   */
  beforeEach((done) => {
    // remove all users from db before running test
    Utils.clearCollection(Congregation).then(() => done()).catch(e => done(e));
  });


  it('should save a congregation', done => {
    var validCongregation = new Congregation(seed.validCongregation);
    validCongregation.save().then(doc => {
      expect(doc).to.be.ok();
      Congregation.find({}).then(congregations => {
        expect(congregations.length).to.eql(1);
        expect(congregations[0].name).to.eql(seed.validCongregation.name);
        done();
      })
    })
    .catch(e => done(e));
  });

  it('should not save a congregation', (done) => {
    var invalidCongregation = new Congregation(seed.invalidCongregation);
    invalidCongregation.save().then(doc => {
      throw new Error('expected database query to fail');
      done();
    })
    .catch(e => {
      expect(e).to.be.ok();
      done();
    })
  });

});
