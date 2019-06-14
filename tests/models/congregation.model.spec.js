const expect = require('expect.js');
const appRoot = require('app-root-path');
const {ValidationError} = require('mongoose').Error;

const {helpers} = require(`${appRoot}/utils`);
const congregationSeed = require('../seed/congregation.seed');
const {CongregationModel} = require(`${appRoot}/models`);


describe('Congregation Model', () => {

  /**
   * Clear User collection before every test
   */
  beforeEach( async () => {
    // remove all users from db before running test
    await helpers.clearCollection(CongregationModel);
  });


  it('should save a congregation', done => {
    var validCongregation = new CongregationModel(congregationSeed.validCongregation);
    validCongregation.save().then(doc => {
      expect(doc).to.be.ok();
      CongregationModel.find({}).then(congregations => {
        expect(congregations.length).to.eql(1);
        expect(congregations[0].name).to.eql(congregationSeed.validCongregation.name);
        done();
      })
    })
    .catch(e => done(e));
  });

  it('should not save a congregation', (done) => {
    var invalidCongregation = new CongregationModel(congregationSeed.invalidCongregation);
    invalidCongregation.save().then(doc => {
      throw new Error('expected database query to fail');
      done();
    })
    .catch(e => {
      expect(e).to.be.ok();
      done();
    })
  });

  it('should throw DuplicateKey mongoose error for duplicate congregation number', async () => {
    let congregation = congregationSeed.validCongregation;
    let congregation1 = await new CongregationModel(congregation).save();
    expect(congregation1).to.have.property('_id');
    let congregation2 = new CongregationModel(congregation);
    try {
      await congregation2.save();
      throw new Error('congregation2.save() should have thrown validation error');
    } catch (e) {
      expect(e instanceof ValidationError).to.be.true;
      // 11000 is DuplicateKey mongoose error code
      expect(e.code).to.equal(11000);
    }

  });

});
