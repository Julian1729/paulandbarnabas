const {expect} = require('chai');
const {ObjectId} = require('mongodb');
const appRoot = require('app-root-path');

const errors = require(`${appRoot}/errors`);
const {helpers} = require(`${appRoot}/utils`);
const userSeed = require('../seed/user.seed');
const {accountServices} = require(`${appRoot}/services`);
const congregationSeed = require('../seed/congregation.seed');
const {UserModel, CongregationModel, TerritoryModel} = require(`${appRoot}/models`);

describe('Account Services', () => {

  before(async () => {
    // clear out congregation collection
    await helpers.clearCollection(CongregationModel);
    // add seed congregation
    await new CongregationModel(congregationSeed.validCongregation).save();
  });

  beforeEach(async () => {
    // remove all users from db before running test
    await helpers.clearCollection(UserModel);
  });

  describe('authenticateUserCredentials', () => {

    it('should pass credential authentication', async () => {

      let seedUser = userSeed.validUser;
      let testUser = new UserModel(userSeed.validUser);
      let newUser = await testUser.save();
      let retrievedUser = await accountServices.authenticateUserCredentials(seedUser.email, seedUser.password);
      expect(retrievedUser).to.exist;
      expect(retrievedUser.first_name).to.equal(testUser.first_name);

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

  describe('registerUser', () => {

    it('should succesfully register user', async () => {

      let seedUser = userSeed.validUser;
      let newUser = await accountServices.registerUser({
        first_name: 'Julian',
        last_name: 'Hernandez',
        email: 'hernandez.julian17@gmail.com',
        congregation_number: 99499,
        phone_number: '2154000468',
        password: 'julianpassword'
      });
      expect(newUser).to.exist;
      expect(newUser).to.have.property('_id');
      let findUser = await UserModel.findOne({email: seedUser.email});
      expect(findUser).to.exist;
      expect(findUser).to.have.property('_id');
      expect(findUser).to.have.property('first_name');

    });

    it('should fail in registering user', async () => {

      await accountServices.registerUser({
        first_name: 'Julian',
        last_name: 'Hernandez',
        email: 'hernandez.julian17@gmail.com',
        phone_number: '2154000468',
        congregation_number: 99499,
        password: 'julianpassword'
      });

      try {

        await accountServices.registerUser({
          first_name: 'Julian',
          last_name: 'Hernandez',
          email: 'hernandez.julian17@gmail.com',
          congregation_number: 99499,
          phone_number: '2154000468',
          password: 'julianpassword'
        });
        throw 'EmailAlreadyExists error should have been thrown';

      }catch(e){

        expect(e instanceof errors.EmailAlreadyExists).to.be.true;

      }

    });

    it('should throw CongregationNotFound error', async () => {

      try{
        await accountServices.registerUser({
          first_name: 'Julian',
          last_name: 'Hernandez',
          email: 'hernandez.julian17@gmail.com',
          phone_number: '2154000468',
          congregation_number: 88988,
          password: 'julianpassword'
        });
        throw 'Congregation should not have been found';
      }catch(e){
        expect(e instanceof errors.CongregationNotFound).to.be.true;
      }

    });

  });

  describe('registerNewCongregationAccount', () => {

    it('should complete full register', async () => {

      await helpers.clearCollection(CongregationModel);
      await helpers.clearCollection(TerritoryModel);
      await helpers.clearCollection(UserModel);

      let adminUserData = {
        first_name: 'Julian',
        last_name: 'Hernandez',
        email: 'hernandez.julian17@gmail.com',
        email_confirm: 'hernandez.julian17@gmail.com',
        phone_number: '2154000468',
        password: 'julianspassword',
        password_confirm: 'julianspassword',
        position: 'I am the service overseer',
      };
      let congregationData = {
        name: 'Roosevelt',
        circuit: 'PA-16',
        city: 'Philadelphia',
        country: 'USA',
        number: 99499,
        language: 'English',
        referall: 'Another congregation',
      };
      let territoryDescription = 'rural type, lots of farms';

      await accountServices.registerNewCongregationAccount(adminUserData, congregationData, territoryDescription);

      expect( await CongregationModel.find({})).to.have.lengthOf(1);
      expect( await TerritoryModel.find({})).to.have.lengthOf(1);
      expect( await UserModel.find({})).to.have.lengthOf(1);

    });

    it('should remove created admin user if congregation could not be created', async () => {

      await helpers.clearCollection(CongregationModel);
      await helpers.clearCollection(TerritoryModel);
      await helpers.clearCollection(UserModel);
      // enter user to be duplicated
      await CongregationModel.create({
        name: 'Roosevelt',
        circuit: 'PA-16',
        city: 'Philadelphia',
        country: 'USA',
        number: 99499,
        language: 'English',
        referall: 'Another congregation',
        admin: new ObjectId(),
        territory: new ObjectId(),
      });

      let adminUserData = {
        first_name: 'Julian',
        last_name: 'Hernandez',
        email: 'hernandez.julian17@gmail.com',
        email_confirm: 'hernandez.julian17@gmail.com',
        phone_number: '2154000468',
        password: 'julianspassword',
        password_confirm: 'julianspassword',
        position: 'I am the service overseer',
      };
      let congregationData = {
        name: 'Roosevelt',
        circuit: 'PA-16',
        city: 'Philadelphia',
        country: 'USA',
        number: 99499,
        language: 'English',
        referall: 'Another congregation',
      };
      let territoryDescription = 'rural type, lots of farms';

      try{
        await accountServices.registerNewCongregationAccount(adminUserData, congregationData, territoryDescription);
        throw 'this should not have passed';
      }catch(e){
        expect(e instanceof errors.CongregationNumberAlreadyExists).to.be.true;
      }

      expect( await CongregationModel.find({})).to.have.lengthOf(1);
      expect( await TerritoryModel.find({})).to.have.lengthOf(0);
      expect( await UserModel.find({})).to.have.lengthOf(0);

    });

  });

});
