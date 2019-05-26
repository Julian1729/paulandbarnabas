const expect = require('expect.js');
const appRoot = require('app-root-path');

const {helpers} = require(`${appRoot}/utils`);
const seed = require('../seed/congregation.seed');
const {CongregationModel} = require(`${appRoot}/models`);


describe('Congregation Model', () => {

  /**
   * Clear User collection before every test
   */
  beforeEach((done) => {
    // remove all users from db before running test
    helpers.clearCollection(CongregationModel).then(() => done()).catch(e => done(e));
  });


  it('should save a congregation', done => {
    var validCongregation = new CongregationModel(seed.validCongregation);
    validCongregation.save().then(doc => {
      expect(doc).to.be.ok();
      CongregationModel.find({}).then(congregations => {
        expect(congregations.length).to.eql(1);
        expect(congregations[0].name).to.eql(seed.validCongregation.name);
        done();
      })
    })
    .catch(e => done(e));
  });

  it('should not save a congregation', (done) => {
    var invalidCongregation = new CongregationModel(seed.invalidCongregation);
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
