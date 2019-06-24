const {expect} = require('chai');
const appRoot = require('app-root-path');
const {ObjectId} = require('mongodb');
const {mockRequest, mockResponse} = require('mock-req-res');

const errors = require(`${appRoot}/errors`);
const {helpers} = require(`${appRoot}/utils`);
const {UserModel, CongregationModel} = require(`${appRoot}/models`);
const Session = require(`${appRoot}/utils/Session`);
const {SessionUninitialized} = require(`${appRoot}/errors`);
const userSeed = require(`${appRoot}/tests/seed/user.seed`);
const congregationSeed = require(`${appRoot}/tests/seed/congregation.seed`);

describe('Session Class', () => {

  it('should be instantiable', () => {

    let req = mockRequest({session: {first_name: 'Julian', authenticated: true}});
    let session = new Session(req);
    expect(session.isAuthenticated).to.be.a('function');

  });

  it('should pass validation', () => {

    let req = mockRequest({
      session: {
        first_name: 'Julian',
        last_name: 'Hernandez',
        user_id: new ObjectId(),
        congregation: new ObjectId(),
        isAdmin: false
      }
    });
    let session = new Session(req);
    expect(session.validate).to.be.a('function');
    expect(session.validate()).to.have.lengthOf(0);

  });

  it('should fail validation and return failed properties', () => {

    let req = mockRequest({
      session: {
        first_name: null,
        last_name: null,
        user_id: new ObjectId(),
        congregation: new ObjectId(),
        isAdmin: false
      }
    });
    let session = new Session(req);
    expect(session.validate).to.be.a('function');
    expect(session.validate()).to.have.lengthOf(2);
    expect(session.validate()).to.include('first_name');

  });

  it('should return valid', () => {

    let req = mockRequest({
      session: {
        first_name: 'Julian',
        last_name: 'Hernandz',
        user_id: new ObjectId(),
        congregation: new ObjectId(),
        isAdmin: false
      }
    });
    let session = new Session(req);
    expect(session.isValid()).to.equal(true);

  });

  it('should return invalid', () => {

    let req = mockRequest({
      session: {
        first_name: null,
        last_name: null,
        user_id: new ObjectId(),
        congregation: new ObjectId(),
        isAdmin: false
      }
    });
    let session = new Session(req);
    expect(session.isValid()).to.equal(false);

  });

  it('should return authenticated', () => {

    let req = mockRequest({session: {authenticated: true}});
    let session = new Session(req);
    expect(session.isAuthenticated).to.be.a('function');
    expect(session.isAuthenticated()).to.equal(true);

  });

  it('should return not authenticated', () => {

    let req = mockRequest({session: {}});
    let session = new Session(req);
    expect(session.isAuthenticated).to.be.a('function');
    expect(session.isAuthenticated()).to.equal(false);

  });

  describe('hasSession', () => {

    it('should recognize req has session', () => {

      let req = mockRequest({session: {first_name: 'Julian'}});
      let session = new Session(req);
      expect(session.hasSession).to.be.a('function');
      expect(session.hasSession()).to.equal(true);

    });

    it('should recognize req.session does not exist', () => {

      let req = mockRequest({});
      let session = new Session(req);
      expect(session.hasSession).to.be.a('function');
      expect(session.hasSession()).to.equal(false);

    });

  });

  describe('create', () => {

    let seedUser = null;
    let seedCongregation = null;

    // in order to create session it will check
    // the users congregation admin to see if ids
    // match therefore this seed data is necessary
    beforeEach(async () => {

      await helpers.clearCollection(CongregationModel);

      seedCongregation = await CongregationModel.create(congregationSeed.validCongregation);

      await helpers.clearCollection(UserModel);

      let userToSeed = userSeed.validUser;
      // manually change congregation
      userToSeed.congregation = seedCongregation._id;
      seedUser = await UserModel.create(userToSeed);

      // set congregation admin
      seedCongregation.admin = seedUser._id;
      seedCongregation = await seedCongregation.save();

    });

    it('should create session on request', async () => {

      let req = mockRequest({session: {}});
      // attempt to create session
      let session = new Session(req);
      await session.create(seedUser);

    });

    it('should actually attach session data to request', async () => {

      let req = mockRequest({session: {}});
      // attempt to create session
      let session = new Session(req);
      await session.create(seedUser);
      expect(req.session).to.have.property('first_name');
      expect(req.session).to.have.property('last_name');
      expect(req.session).to.have.property('user_id');
      expect(req.session).to.have.property('congregation');
      expect(req.session).to.have.property('isAdmin');
      expect(req.session.isAdmin).to.be.true;

    });

    it('should create session on request with no session object', async () => {

      let req = mockRequest({});
      // attempt to create session
      let session = new Session(req);
      await session.create(seedUser);

    });

    it('should throw error with missing user data', async () => {

      // insert user into db
      let req = mockRequest({session: {}});
      // attempt to create session
      let session = new Session(req);
      try{
        await session.create({
          first_name: 'Julian',
          last_name: 'Hernandez',
          congregation: seedCongregation._id
        });
        throw new Error('Session should have thrown SessionUninitialized error');
      }catch(e){
        expect(e instanceof SessionUninitialized).to.be.true;
      }

    });

  });

  describe('isAdmin', () => {

    it('should return true that user is admin', () => {

      let req = mockRequest({session: {isAdmin: false}});
      let session = new Session(req);
      session.isAdmin = true;
      expect(session.isAdmin).to.be.true;

    });

    it('should return false that user is admin', () => {

      let req = mockRequest({session: {isAdmin: false}});
      let session = new Session(req);
      expect(session.isAdmin).to.be.false;

    });

  });

});
