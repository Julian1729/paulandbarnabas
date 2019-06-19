const {expect} = require('chai');
const {ObjectId} = require('mongodb');
const appRoot = require('app-root-path');

const errors = require(`${appRoot}/errors`);
const {helpers} = require(`${appRoot}/utils`);
const userSeed = require('../seed/user.seed');
const {userServices} = require(`${appRoot}/services`);
const congregationSeed = require('../seed/congregation.seed');
const {UserModel, CongregationModel} = require(`${appRoot}/models`);

describe('User Services', () => {

  let seedCongregation = null;
  let seedCongregation2 = null;
  let seedUser = null;

  before(async () => {

    await helpers.clearCollection(CongregationModel);

    seedCongregation = await CongregationModel.create(congregationSeed.validCongregation);

    // enter another congregation that will have random id as admin
    seedCongregation2 = await CongregationModel.create({
      name: 'North',
      circuit: 'PA-16',
      number: 885588,
      language: 'en',
      territory: new ObjectId(),
      admin: new ObjectId()
    });

    await helpers.clearCollection(UserModel);

    let userToSeed = userSeed.validUser;
    // manually change congregation
    userToSeed.congregation = seedCongregation._id;
    seedUser = await UserModel.create(userToSeed);

    // set congregation admin
    seedCongregation.admin = seedUser._id;
    seedCongregation = await seedCongregation.save();

  });

  describe('isAdmin', () => {

    it('should return true that user is admin', async () => {

      let result = await userServices.isAdmin(seedUser);
      expect(result).to.be.true;

    });

    it('should return false that user is admin', async () => {

      let result = await userServices.isAdmin({congregation: seedCongregation2._id});
      expect(result).to.be.false;

    });

    it('should throw CongregationNotFound error', async () => {

      try{
        let result = await userServices.isAdmin({congregation: new ObjectId()});
        throw 'userServices.isAdmin() should have thrown CongregationNotFound error';
      }catch(e){
        expect(e instanceof errors.CongregationNotFound).to.be.true;
      }

    });

  });

});
