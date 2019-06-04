const {expect} = require('chai');
const appRoot = require('app-root-path');
const {ObjectId} = require('mongodb');
const {mockRequest, mockResponse} = require('mock-req-res');

const errors = require(`${appRoot}/errors`);
const {helpers} = require(`${appRoot}/utils`);
const {UserModel} = require(`${appRoot}/models`);
const Session = require(`${appRoot}/utils/Session`);
const {SessionUninitialized} = require(`${appRoot}/errors`);
const userSeed = require(`${appRoot}/tests/seed/user.seed`);

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

    it('should create session on request', async () => {

      await helpers.clearCollection(UserModel);
      // insert user into db
      let testUser = new UserModel(userSeed.validUser);
      let user = await testUser.save();
      let req = mockRequest({session: {}});
      // attempt to create session
      let session = new Session(req);
      session.create(user);

    });

    it('should create session on request with no session object', async () => {

      await helpers.clearCollection(UserModel);
      // insert user into db
      let testUser = new UserModel(userSeed.validUser);
      let user = await testUser.save();
      let req = mockRequest({});
      // attempt to create session
      let session = new Session(req);
      session.create(user);

    });

    it('should throw error with missing user data', () => {

      // insert user into db
      let req = mockRequest({session: {}});
      // attempt to create session
      let session = new Session(req);
      try{
        session.create({first_name: 'Julian', last_name: 'Hernandez'});
        throw new Error('Session should have thrown SessionUninitialized error');
      }catch(e){
        expect(e instanceof SessionUninitialized).to.be.true;
      }

    });

  });

});
