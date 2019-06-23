const _ = require('lodash');
const {expect} = require('chai');
const request = require('supertest');
const {ObjectId} = require('mongodb');
const appRoot = require('app-root-path');
const session = require('supertest-session');

const {app} = require(`${appRoot}/app`);
const {helpers} = require(`${appRoot}/utils`);
const {UserModel, CongregationModel} = require(`${appRoot}/models`);
const userSeed = require(`${appRoot}/tests/seed/user.seed`);
const congregationSeed = require(`${appRoot}/tests/seed/congregation.seed`);
const registrationSeed = require(`${appRoot}/tests/seed/registration.seed`);

describe('AJAX /account', () => {

  describe('/login', () => {

    it('should reach endpoint and authenticate credentials', async () => {

      // seed db with congregation
      await helpers.clearCollection(CongregationModel);
      let seedCongregation = await CongregationModel.create(congregationSeed.validCongregation);

      // clear user db
      await helpers.clearCollection(UserModel);
      // add user to database
      let testUser = _.clone(userSeed.validUser);
      testUser.congregation = seedCongregation._id;
      let seedUser = new UserModel(testUser);
      let newUser = await seedUser.save();

      // set congregation admin as user
      seedCongregation.admin = seedUser._id;
      await seedCongregation.save();

      await request(app)
        .post('/ajax/account/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).to.have.property('data')
          expect(res.body.data).to.have.property('redirect');
        });

    });

    it('should respond with INVALID_CREDENTIALS error', async () => {

      await request(app)
        .post('/ajax/account/login')
        .send({
          email: 'doesnotexist@none.com',
          password: 'wrongpasswordto'
        })
        .expect(200)
        .expect(res => {
          expect(res.body).to.have.property('data')
          expect(res.body.data).to.not.have.property('redirect');
          expect(res.body.error.type).to.equal('INVALID_CREDENTIALS');
        })

    });

    it('should respond with FORM_VALIDATION_ERROR error', async () => {

      await request(app)
        .post('/ajax/account/login')
        .send({
          email: '',
          password: 'wrongpasswordto'
        })
        .expect(200)
        .expect(res => {
          expect(res.body).to.have.property('data')
          expect(res.body.data).to.not.have.property('redirect');
          expect(res.body.error.type).to.equal('FORM_VALIDATION_ERROR');
          expect(res.body.error).to.have.property('validationErrors');
          expect(res.body.error.validationErrors).to.have.property('email');
        })

      await request(app)
        .post('/ajax/account/login')
        .send({
          email: '',
          password: ''
        })
        .expect(200)
        .expect(res => {
          expect(res.body).to.have.property('data')
          expect(res.body.data).to.not.have.property('redirect');
          expect(res.body.error.type).to.equal('FORM_VALIDATION_ERROR');
          expect(res.body.error).to.have.property('validationErrors');
          expect(res.body.error.validationErrors).to.have.property('email');
          expect(res.body.error.validationErrors).to.have.property('password');
        })

    });

  });

  describe('/register', () => {

    beforeEach(async () => {

      // clear user db
      await helpers.clearCollection(UserModel);

    });

    it('should succesfully register user', async () => {

      let registration = registrationSeed.valid;

      await request(app)
        .post('/ajax/account/register')
        .send(registration)
        .expect(200)
        .expect(res => {
          expect(res.body).to.have.property('data');
          expect(res.body.error.type).to.not.exist;
          expect(res.body.data).to.have.property('redirect');
        });

    });

    it('should fail with UNREGISTERED_CONGREGATION', async () => {

      let registration = {
         first_name: 'Julian',
         last_name: 'Hernandez',
         email: 'hernandez.julian17@gmail.com',
         email_confirm: 'hernandez.julian17@gmail.com',
         phone_number: '(215)400-0468',
         congregation_number: 55555,
         title: 'Ministerial Servant',
         password: 'newpasssword',
         password_confirm: 'newpasssword',
         congregation: new ObjectId()
      };

      await request(app)
        .post('/ajax/account/register')
        .send(registration)
        .expect(200)
        .expect(res => {
          expect(res.body.error).to.exist;
          expect(res.body.error.type).to.equal('UNREGISTERED_CONGREGATION');
        });

    });

    it('should fail with FORM_VALIDATION_ERROR', async () => {

      let registration = registrationSeed.decimalCongregationNumber;

      await request(app)
        .post('/ajax/account/register')
        .send(registration)
        .expect(200)
        .expect(res => {
          expect(res.body.error).to.exist;
          expect(res.body.error.type).to.equal('FORM_VALIDATION_ERROR');
          expect(res.body.error.validationErrors.congregation_number).to.exist;
        });

    });

  });

});
