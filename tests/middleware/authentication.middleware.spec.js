const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
const HttpStatus = require('http-status-codes');
const {mockResponse, mockRequest} = require('mock-req-res');
const appRoot = require('app-root-path');

const {Session} = require(`${appRoot}/utils`);
const {authentication} = require(`${appRoot}/middleware`);
const sessionSeed = require(`${appRoot}/tests/seed/session.seed`);

describe('Authenticate Middleware', () => {

  describe('session', () => {

    it('should call next', () => {

      let res = mockResponse();
      let req = mockRequest({session: sessionSeed.valid});
      let next = sinon.stub();

      authentication.session(req, res, next);
      expect(res.send).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;

    });

    it('should redirect to landing page UNAUTHORIZED', () => {

      let res = mockResponse();
      let req = mockRequest({session: {}});
      let next = sinon.stub();

      authentication.admin(req, res, next);
      expect(res.redirect).to.have.been.calledOnceWith('/');

    });

  });

  describe('ajaxSession', () => {

    it('should call next', () => {

      let res = mockResponse();
      let req = mockRequest({session: sessionSeed.valid});
      let next = sinon.stub();

      authentication.ajaxSession(req, res, next);
      expect(res.send).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;

    });

    it('should respond with 401 UNAUTHORIZED', () => {

      let res = mockResponse();
      let req = mockRequest({});
      let next = sinon.stub();

      authentication.ajaxSession(req, res, next);
      expect(res.status).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(HttpStatus.UNAUTHORIZED);

    });

  });

  describe('admin', () => {

    it('should call next', () => {

      let res = mockResponse();
      let req = mockRequest({session: sessionSeed.admin});
      let next = sinon.stub();

      authentication.admin(req, res, next);
      expect(next).to.have.been.calledOnce;

    });

    it('should redirect to landing page FORBIDDEN', () => {

      let res = mockResponse();
      let req = mockRequest({session: sessionSeed.valid});
      let next = sinon.stub();

      authentication.admin(req, res, next);
      expect(res.redirect).to.have.been.calledOnceWith('/');

    });

  });

  describe('ajaxAdmin', () => {

    it('should call next', () => {

      let res = mockResponse();
      let req = mockRequest({session: sessionSeed.admin});
      let next = sinon.stub();

      authentication.ajaxAdmin(req, res, next);
      expect(res.send).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;

    });

    it('should respond with 403 FORBIDDEN', () => {

      let res = mockResponse();
      let req = mockRequest({session: sessionSeed.valid});
      let next = sinon.stub();

      authentication.ajaxAdmin(req, res, next);
      expect(res.status).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(HttpStatus.FORBIDDEN);

    });

  });

  describe('devSessionAdmin', () => {

    let ogEnv = null;
    let seedDatabase = require(`${appRoot}/dev/seed-database`);
    before(async () => {

      // cache database seed
      await seedDatabase.init(false);
      // og env
      ogEnv = process.env.NODE_ENV;

    });

    after(() => {

      // set back to original env
      process.env.NODE_ENV = ogEnv;

    });

    it('should create dev session', async () => {

      // set env to development
      process.env.NODE_ENV = 'development';

      let res = mockResponse();
      let req = mockRequest();
      let next = sinon.stub();

      sinon.spy(Session.prototype, 'create');

      await authentication.devSessionAdmin(req, res, next);
      expect(Session.prototype.create).to.have.been.called;
      expect(req.session).to.not.be.empty;
      expect(req.session).to.have.property('first_name');
      expect(req.session).to.have.property('last_name');
      expect(req.session).to.have.property('user_id');
      expect(req.session).to.have.property('congregation');
      expect(req.session).to.have.property('isAdmin');
      expect(req.session.isAdmin).to.be.true;
      expect(req.session).to.have.property('authenticated');
      expect(next).to.have.been.calledOnce;

      Session.prototype.create.restore();

      // reset og env
      process.env.NODE_ENV = ogEnv;

    });

    it('should skip middleware and call next', async () => {

      let res = mockResponse();
      let req = mockRequest();
      let next = sinon.stub();

      sinon.spy(Session.prototype, 'create');

      await authentication.devSessionAdmin(req, res, next);
      expect(Session.prototype.create).to.not.have.been.called;
      expect(req).to.not.have.property('session');
      expect(next).to.have.been.called;

      Session.prototype.create.restore();

    });

  });

});
