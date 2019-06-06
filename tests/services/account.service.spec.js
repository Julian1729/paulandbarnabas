const {expect} = require('chai');
const appRoot = require('app-root-path');

const errors = require(`${appRoot}/errors`);
const {helpers} = require(`${appRoot}/utils`);
const userSeed = require('../seed/user.seed');
const {UserModel} = require(`${appRoot}/models`);
const {accountServices} = require(`${appRoot}/services`);

describe('Account Services', () => {

  beforeEach(async () => {
    // remove all users from db before running test
    await helpers.clearCollection(UserModel);
  });

  describe('authenticateUserCredentials', () => {

    it('should pass credential authentication', async () => {

      let seedUser = userSeed.validUser;
      let testUser = new UserModel(userSeed.validUser);
      let newUser = await testUser.save();
      let retreivedUser = await accountServices.authenticateUserCredentials(seedUser.email, seedUser.password);
      expect(retrieved).to.exist;
      expect(retrieved.first_name).to.equal(testUser.first_name);

    });

    it('should fail credential authentication', async () => {

      let testUser = new UserModel(userSeed.validUser);
      let newUser = await testUser.save();
      try{
        let retrieved = await accountServices.authenticateUserCredentials(testUser.email, 'notthesamepassword');
        throw new Error('This should not have ran.');
      }catch(e){
        expect(e instanceof errors.InvalidCredentials).to.be.true;
      }

    });

  });

});
