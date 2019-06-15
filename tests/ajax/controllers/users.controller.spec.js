const {expect} = require('chai');
const {ObjectId} = require('mongodb');
const appRoot = require('app-root-path');
const session = require('supertest-session');

const {app} = require(`${appRoot}/app`);
const {helpers} = require(`${appRoot}/utils`);
const userSeed = require(`${appRoot}/tests/seed/user.seed`);
const {UserModel, CongregationModel} = require(`${appRoot}/models`);
const congregationSeed = require(`${appRoot}/tests/seed/congregation.seed`);
const registrationSeed = require(`${appRoot}/tests/seed/registration.seed`);

describe('AJAX /users', () => {

  let seedCongregation = null;
  let seedUserAdmin = null;
  let authenticatedSession = null;

  before(async () => {

    // clear users collection
    await helpers.clearCollection(UserModel);
    // clear congregation collection
    await helpers.clearCollection(CongregationModel);
    // enter seed congregation
    seedCongregation = await CongregationModel.create(congregationSeed.validCongregation);
    // define seed users
    let usersToSeed = [
      {
        first_name: 'Julian',
        last_name: 'Hernandez',
        email: 'hernandez.julian17@gmail.com',
        phone_number: '(215)400-0468',
        title: 'Ministerial Servant',
        password: 'newpasssword',
        congregation: seedCongregation._id
      },
      {
        first_name: 'Betzaida',
        last_name: 'Hernandez',
        email: '1969b7@gmail.com',
        phone_number: '(215)629-6210',
        title: 'Regular Pioneer',
        password: 'passwordhere',
        congregation: seedCongregation._id
      },
      {
        first_name: 'Julio',
        last_name: 'Hernandez',
        email: 'hernandez.julio212@gmail.com',
        phone_number: '(215)629-6208',
        title: 'Elder',
        password: 'juliopassword',
        congregation: seedCongregation._id
      },
      {
        first_name: 'Michael',
        last_name: 'Scott',
        email: 'littlekidlover@gmail.com',
        phone_number: '(215)555-5555',
        title: 'Publisher',
        password: 'passwordduh',
        congregation: new ObjectId()
      },
    ];
    // seed to db
    let seedUsers = await UserModel.create(usersToSeed);

    seedUserAdmin = seedUsers[0];
    // set unsalted password as password
    seedUserAdmin.rawPassword = usersToSeed[0].password;

    // set user one as congregation admin
    seedCongregation.admin = seedUserAdmin._id;
    await seedCongregation.save();

    let initSession = session(app);
    await initSession
      .post('/ajax/account/login')
      .send({ email: seedUserAdmin.email, password: seedUserAdmin.rawPassword })
      .expect(200)
      .expect(res => {
        authenticatedSession = initSession;
      });

  });

  // var authenticatedSession;
  //
  // beforeEach(async () => {
  //   let initSession = session(app);
  //   await initSession
  //     .post('/ajax/account/login')
  //     .send({ email: seedUserAdmin.email, password: seedUserAdmin.rawPassword })
  //     .expect(200)
  //     .expect((e) => {
  //       if (e) return done(e);
  //       authenticatedSession = initSession;
  //     });
  // });

  it('[test] should set first seeded user as admin', (done) => {

    CongregationModel.findOne({_id:seedCongregation._id})
      .then(congregation => {
        expect(congregation).to.exist;
        expect(congregation.admin.equals(seedUserAdmin._id)).to.be.true;
        done();
      })
      .catch(e => done(e));

  });

  describe('/list', () => {

    it('should get a list of all users attached to logged in congregation', async () => {

      await authenticatedSession
        .get('/ajax/users/list')
        .expect(200)
        .expect(res => {
          expect(res.body.data).to.have.property('users');
          expect(res.body.data.users).to.have.lengthOf(3);
          expect(res.body.data.users[0]).to.not.have.property('password');
        });

    });

    it('should get a list with only needed fields', async () => {

      await authenticatedSession
        .get(`/ajax/users/list?fields=${encodeURIComponent('first_name last_name email')}`)
        .expect(200)
        .expect(res => {
          expect(res.body.data).to.have.property('users');
          expect(res.body.data.users).to.have.lengthOf(3);
          expect(res.body.data.users[0]).to.have.property('first_name')
          expect(res.body.data.users[0]).to.have.property('last_name')
          expect(res.body.data.users[0]).to.have.property('email')
          expect(res.body.data.users[0]).to.not.have.property('phone_number');
          expect(res.body.data.users[0]).to.not.have.property('title');
        });

    });

  });

});
