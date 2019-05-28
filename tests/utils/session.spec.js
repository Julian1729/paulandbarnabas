const {expect} = require('chai');
const appRoot = require('app-root-path');
const {ObjectId} = require('mongodb');
const {mockRequest, mockResponse} = require('mock-req-res');

const errors = require(`${appRoot}/errors`);
const Session = require(`${appRoot}/utils/Session`);

describe('Session Class', () => {

  it('should be instantiable', () => {

    let req = mockRequest({session: {first_name: 'Julian', authenticated: true}});
    let session = new Session(req);
    expect(session.isAuthenticated).to.be.a('function');

  });

  it('should throw SessionUninitialized', () => {

    let req = mockRequest();
    try {
      new Session(req);
      throw new Error('Session should have thrown SessionUninitialized');
    } catch (e) {
      expect(e instanceof errors.SessionUninitialized).to.be.true;
    }

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

});
