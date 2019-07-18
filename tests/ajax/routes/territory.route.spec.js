const {expect} = require('chai');
const {ObjectId} = require('mongodb');
const appRoot = require('app-root-path');
const session = require('supertest-session');
const HttpStatus = require('http-status-codes');

const {app} = require(`${appRoot}/app`);
const {helpers} = require(`${appRoot}/utils`);
const userSeed = require(`${appRoot}/tests/seed/user.seed`);
const {UserModel, CongregationModel, TerritoryModel} = require(`${appRoot}/models`);
const congregationSeed = require(`${appRoot}/tests/seed/congregation.seed`);

describe('AJAX /territory', () => {

let seedCongregation = null;
let seedUserAdmin = null;
let seedTerritory = null;

  before(async () => {

    // clear users collection
    await helpers.clearCollection(UserModel);
    // clear congregation collection
    await helpers.clearCollection(CongregationModel);
    // enter seed congregation
    seedCongregation = await CongregationModel.create(congregationSeed.validCongregation);
    // define seed users
    let userToSeed = {
        first_name: 'Julian',
        last_name: 'Hernandez',
        email: 'hernandez.julian17@gmail.com',
        phone_number: '(215)400-0468',
        title: 'Ministerial Servant',
        password: 'newpasssword',
        congregation: seedCongregation._id
      };
    // seed to db
    seedUserAdmin = await UserModel.create(userToSeed);
    seedUserAdmin.rawPassword = userToSeed.password;
    // set user one as congregation admin
    seedCongregation.admin = seedUserAdmin._id;
    await seedCongregation.save();

  });

  beforeEach(async () => {

    // clear and reset territory after each test
    await helpers.clearCollection(TerritoryModel);
    // seed with empty territory w/ congregation set to seed congregation
    seedTerritory = await TerritoryModel.create({
      congregation: seedCongregation._id,
      fragments: [],
      streets: []
    });

  });

  let authenticatedSession = null;
  beforeEach(async () => {

    let initSession = session(app);
    await initSession
      .post('/ajax/account/login')
      .send({ email: seedUserAdmin.email, password: seedUserAdmin.rawPassword })
      .expect(200)
      .expect(res => {
        authenticatedSession = initSession;
      });

  });

  describe('GET /street/:street_name/stats', () => {


    it('should get street stats', async () => {

      // seed street
      let seedStreet = seedTerritory.addStreet('Oakland');
      let seedHundred = seedStreet.addHundred(4500);
      // add 3 units
      seedHundred.addUnits([{number: 4502}, {number: 4504}, {number: 4506}]);
      await seedTerritory.save();

      await authenticatedSession
        .get('/ajax/territory/street/Oakland/stats')
        .expect(200)
        .expect(res => {
          expect(res.body.data).to.have.property('stats');
          expect(res.body.data.stats).to.eql({
            totals: {
              hundreds: 1,
              units: 3
            },
            hundreds: {
              '4500': {
                even_count: 3,
                odd_count: 0
              }
            }
          });
        });

    });

    it('should respond with 404', async () => {


      await authenticatedSession
        .get('/ajax/territory/street/Oakland/stats')
        .expect(HttpStatus.NOT_FOUND);

    });

  });

});
