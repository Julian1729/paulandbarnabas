const sinon = require('sinon');
const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const {ObjectId} = require('mongodb');
const HttpStatus = require('http-status-codes');
const {mockResponse, mockRequest} = require('mock-req-res');
const appRoot = require('app-root-path');

const {helpers, AjaxResponse} = require(`${appRoot}/utils`);
const {UserModel, CongregationModel, TerritoryModel} = require(`${appRoot}/models`);
const registrationSeed = require(`${appRoot}/tests/seed/registration.seed`);
const userSeed = require(`${appRoot}/tests/seed/user.seed`);
const congregationSeed = require(`${appRoot}/tests/seed/congregation.seed`);
const accountController = require(`${appRoot}/ajax/controllers/account`);

describe('Account Controller', () => {

let seedCongregation = null;
let seedUser = null;
// let authenticatedSession = null;

before(async () => {

  // clear users collection
  await helpers.clearCollection(UserModel);
  // clear congregation collection
  await helpers.clearCollection(CongregationModel);
  // enter seed congregation
  seedCongregation = await CongregationModel.create(congregationSeed.validCongregation);
  // seed user to db
  let seedUserData = {
    first_name: 'Julian',
    last_name: 'Hernandez',
    email: 'hernandez.julian17@gmail.com',
    phone_number: '(215)400-0468',
    title: 'Ministerial Servant',
    password: 'newpasssword',
    congregation: seedCongregation._id
  };
  seedUser = await UserModel.create(seedUserData);
  // set unsalted password as password
  seedUser.rawPassword = seedUserData.password;

  // set user one as congregation admin
  seedCongregation.admin = seedUser._id;
  await seedCongregation.save();

});

  describe('login', () => {

    before(() => {

      // set error as spy
      sinon.spy(AjaxResponse.prototype, 'error');

    });

    after(() => {

      // restore original method
      AjaxResponse.prototype.error.restore();

    });

    it('should login user', async () => {

      let req = mockRequest({
        body: {
          email: seedUser.email,
          password: seedUser.rawPassword
        }
      });
      let res = mockResponse();

      await accountController.login(req, res);
      expect(AjaxResponse.prototype.error).to.not.have.been.called;
      expect(req.session).to.not.be.empty;
      expect(req.session).to.have.property('first_name');
      expect(req.session).to.have.property('last_name');
      expect(req.session).to.have.property('congregation');
      expect(req.session).to.have.property('user_id');
      expect(req.session).to.have.property('isAdmin');
      expect(req.session.isAdmin).to.be.true;
      expect(res.json).to.have.been.calledOnce;

    });

    it('should set form FORM_VALIDATION_ERROR', async () => {

      let req = mockRequest({
        body: {
          email: seedUser.email,
          password: ''
        }
      });
      let res = mockResponse();

      await accountController.login(req, res);
      expect(AjaxResponse.prototype.error).to.have.been.calledWith('FORM_VALIDATION_ERROR');
      expect(res.json).to.have.been.calledOnce;

    });

    it('should set form FORM_VALIDATION_ERROR', async () => {

      let req = mockRequest({
        body: {
          email: seedUser.email,
          password: 'wrongpassword'
        }
      });
      let res = mockResponse();

      await accountController.login(req, res);
      expect(AjaxResponse.prototype.error).to.have.been.calledWith('INVALID_CREDENTIALS');
      expect(res.json).to.have.been.calledOnce;

    });

  });

  describe('Registration', () => {

    afterEach(() => {

      // restore original method
      AjaxResponse.prototype.error.restore();

    });

    beforeEach(async () => {

      sinon.spy(AjaxResponse.prototype, 'error');

      // clear user collection
      await helpers.clearCollection(UserModel);

    });

    describe('User', () => {

      it('should register a user', async () => {

        let registration = _.clone(registrationSeed.valid);
        registration.congregation = seedCongregation._id;

        let req = mockRequest({
          body: registration
        });
        let res = mockResponse();

        await accountController.registerUser(req, res);

        expect(AjaxResponse.prototype.error).to.not.have.been.called;
        expect(req.session).to.not.be.empty;
        expect(req.session).to.have.property('first_name');
        expect(req.session).to.have.property('last_name');
        expect(req.session).to.have.property('user_id');
        expect(req.session).to.have.property('congregation');
        expect(req.session).to.have.property('isAdmin');

      });

      it('should return FORM_VALIDATION_ERROR', async () => {

        let registration = _.clone(registrationSeed.passwordUnmatched);
        registration.congregation = seedCongregation._id;

        let req = mockRequest({
          body: registration
        });
        let res = mockResponse();

        await accountController.registerUser(req, res);

        expect(AjaxResponse.prototype.error).to.have.been.calledWith('FORM_VALIDATION_ERROR');

      });

      it('should return FORM_VALIDATION_ERROR for existing email', async () => {

        await UserModel.create(userSeed.validUser);

        let registration = _.clone(registrationSeed.valid);
        registration.congregation = seedCongregation._id;

        let req = mockRequest({
          body: registration
        });
        let res = mockResponse();

        await accountController.registerUser(req, res);

        expect(AjaxResponse.prototype.error).to.have.been.calledWith('FORM_VALIDATION_ERROR');

      });

      it('should return UNREGISTERED_CONGREGATION', async () => {

        let req = mockRequest({
          body: {
           first_name: 'Julian',
           last_name: 'Hernandez',
           email: 'hernandez.julian17@gmail.com',
           email_confirm: 'hernandez.julian17@gmail.com',
           phone_number: '(215)400-0468',
           congregation_number: 55555,
           title: 'Ministerial Servant',
           password: 'newpasssword',
           password_confirm: 'newpasssword',
          }
        });
        let res = mockResponse();

        await accountController.registerUser(req, res);

        expect(AjaxResponse.prototype.error).to.have.been.calledOnceWith('UNREGISTERED_CONGREGATION');
        expect(res.json).to.have.been.calledOnce;

      });


    });

    describe('Congregation', () => {

      beforeEach(async () => {
        await helpers.clearCollection(CongregationModel)
        await helpers.clearCollection(TerritoryModel);
        await helpers.clearCollection(UserModel);
        sinon.spy(AjaxResponse.prototype, 'data');
      });

      afterEach(() => {
        // restore original method
        AjaxResponse.prototype.data.restore();
      });

      it('should register new congregation account', async () => {

        let req = mockRequest({
          body: {
            congregation: {
              name: 'Roosevelt',
              circuit: 'PA-16',
              city: 'Philadelphia',
              country: 'USA',
              number: 99499,
              language: 'English',
              referall: 'Another congregation',
            },
            user: {
              first_name: 'Julian',
              last_name: 'Hernandez',
              email: 'hernandez.julian17@gmail.com',
              email_confirm: 'hernandez.julian17@gmail.com',
              phone_number: '2154000468',
              password: 'julianspassword',
              password_confirm: 'julianspassword',
              position: 'himself',
            },
            territory: {
              description: 'rural, big city',
            },
          }
        });
        let res = mockResponse();

        await accountController.registerCongregation(req, res);

        expect(AjaxResponse.prototype.error).to.have.not.been.called;
        expect(AjaxResponse.prototype.data).to.have.been.calledWith('admin');
        expect(AjaxResponse.prototype.data).to.have.been.calledWith('congregation');
        expect(AjaxResponse.prototype.data).to.have.been.calledWith('territory');

        // users title should be "Service Overseer"
        // get user
        let user = AjaxResponse.prototype.data.getCall(0).args[1];
        expect(user).to.have.property('title').and.to.equal('Service Overseer');

        // should init session
        expect(req.session).to.exist;
        expect(req.session).to.have.property('user_id');
        expect(req.session).to.have.property('isAdmin');
        expect(req.session.isAdmin).to.be.true;

      });

      it('should send FORM_VALIDATION_ERROR', async () => {

        let req = mockRequest({
          body: {
            congregation: {
              name: 'Roosevelt',
              circuit: 'PA-16',
              city: 'Philadelphia',
              country: 'USA',
              number: 99499,
              language: 'ddd', // invalid language
              referall: 'Another congregation',
            },
            user: {
              first_name: 'Julian',
              last_name: 'Hernandez',
              email: 'hernandez.julian17@gmail.com',
              email_confirm: 'hernandez.julian17@gmail.com',
              phone_number: '2154000468',
              password: 'julianspassword',
              password_confirm: '',
              position: 'himself',
            },
            territory: {
              description: 'rural, big city',
            },
          }
        });
        let res = mockResponse();

        await accountController.registerCongregation(req, res);

        expect(AjaxResponse.prototype.error).to.have.been.calledOnce;
        let {validationErrors} = AjaxResponse.prototype.error.getCall(0).args[2];
        expect(validationErrors).to.have.property('congregation.language');
        expect(validationErrors).to.have.property('user.password_confirm');

      });

      it('should send EMAIL_ALREADY_EXISTS for duplicate email', async () => {

        // insert duplicate user into db
        UserModel.create({
          first_name: 'Julian',
          last_name: 'Hernandez',
          email: 'hernandez.julian17@gmail.com',
          phone_number: '2154000468',
          password: 'julianspassword',
          title: 'Service Overseer',
          congregation: new ObjectId(),
        });

        let req = mockRequest({
          body: {
            congregation: {
              name: 'Roosevelt',
              circuit: 'PA-16',
              city: 'Philadelphia',
              country: 'USA',
              number: 99499,
              language: 'English',
              referall: 'Another congregation',
            },
            user: {
              first_name: 'Julian',
              last_name: 'Hernandez',
              email: 'hernandez.julian17@gmail.com',
              email_confirm: 'hernandez.julian17@gmail.com',
              phone_number: '2154000468',
              password: 'julianspassword',
              password_confirm: 'julianspassword',
              position: 'himself',
            },
            territory: {
              description: 'rural, big city',
            },
          }
        });
        let res = mockResponse();

        await accountController.registerCongregation(req, res);

        expect(AjaxResponse.prototype.error).to.have.been.calledOnceWith('EMAIL_ALREADY_EXISTS');

      });

    });

  });

});
