const {expect} = require('chai');
const request = require('supertest');
const appRoot = require('app-root-path');
const session = require('supertest-session');

const {app} = require(`${appRoot}/app`);
const {helpers} = require(`${appRoot}/utils`);
const {UserModel} = require(`${appRoot}/models`);
const userSeed = require(`${appRoot}/tests/seed/user.seed`);

describe('AJAX /account', () => {

  // var authenticatedSession;
  // beforeEach(done => {
  //   initSession = session(app);
  //   initSession.post('/ajax/account/login')
  //   // use unhashed user seed data
  //     .send({email: user_seed_data[0].email, password: user_seed_data[0].password}).expect(200).end(function(err) {
  //     if (err)
  //       return done(err);
  //     authenticatedSession = initSession;
  //     return done();
  //   });
  // });

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

  });

});
