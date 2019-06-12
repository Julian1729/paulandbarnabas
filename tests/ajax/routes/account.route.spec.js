const {expect} = require('chai');
const request = require('supertest');
const appRoot = require('app-root-path');
const session = require('supertest-session');

const {app} = require(`${appRoot}/app`);
const {helpers} = require(`${appRoot}/utils`);
const {UserModel} = require(`${appRoot}/models`);
const userSeed = require(`${appRoot}/tests/seed/user.seed`);

describe('AJAX /account', () => {

  describe('/login', () => {

    it('should reach endpoint and authenticate credentials', async () => {

      // clear user db
      await helpers.clearCollection(UserModel);

      // add user to database
      let seedUser = userSeed.validUser;
      let testUser = new UserModel(seedUser);
      let newUser = await testUser.save();

      await request(app)
        .post('/ajax/account/login')
        .send({
          email: seedUser.email,
          password: seedUser.password
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

  describe('/signup', () => {

    it('should succesfully signup user', (done) => {



    });

  });

});
