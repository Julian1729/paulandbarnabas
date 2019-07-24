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

  let refreshSeedTerritory = async () => {
    seedTerritory = await TerritoryModel.findOne({_id: seedTerritory._id}).exec();
  };

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

  describe('Block Router /street/:street_name/hundred/:hundred/:side', () => {

    describe('POST /tag/add', () => {

      it('should add tag to even side of 4500 Oakland', async () => {

        // add seeded block
        let seedStreet = seedTerritory.addStreet('Oakland');
        let seedHundred = seedStreet.addHundred(4500);
        seedHundred.addUnits([{number: 4500}, {number: 4502}]);
        await seedTerritory.save();

        await authenticatedSession
          .post('/ajax/territory/street/Oakland/hundred/4500/even/tag/add?tag=low+steps')
          .expect(200)
          .expect(res => {
            expect(res.body.data).to.have.property('tag');
            expect(res.body.data.tag).to.eql('low steps');
          });

      });

    });

    describe('POST /tag/remove', () => {

      it('should remove tag from even side of 4500 Oakland', async () => {

        // add seeded block
        let seedStreet = seedTerritory.addStreet('Oakland');
        let seedHundred = seedStreet.addHundred(4500);
        seedHundred.addUnits([{number: 4500}, {number: 4502}]);
        seedHundred.even.addTag('low steps');
        await seedTerritory.save();

        await authenticatedSession
          .post('/ajax/territory/street/Oakland/hundred/4500/even/tag/remove?tag=low+steps')
          .expect(200);

      });

      it('should respond with MISSING_TAG error', async () => {

        // add seeded block
        let seedStreet = seedTerritory.addStreet('Oakland');
        let seedHundred = seedStreet.addHundred(4500);
        seedHundred.addUnits([{number: 4500}, {number: 4502}]);
        seedHundred.even.addTag('low steps');
        await seedTerritory.save();

        await authenticatedSession
          .post('/ajax/territory/street/Oakland/hundred/4500/even/tag/remove')
          .expect(200)
          .expect(res => {
            expect(res.body.error).to.exist;
            expect(res.body.error.type).to.eql('MISSING_TAG');
          });

      });

    });

    describe('POST /worked', () => {

      it('should mark block as worked', async () => {

        // add seeded block
        let seedStreet = seedTerritory.addStreet('Oakland');
        let seedHundred = seedStreet.addHundred(4500);
        seedHundred.addUnits([{number: 4500}, {number: 4502}]);
        await seedTerritory.save();

        await authenticatedSession
          .post('/ajax/territory/street/Oakland/hundred/4500/even/worked')
          .expect(200);

        // refind in seedTerritory
        let updatedSeedTerritory = await TerritoryModel.findOne({congregation: seedCongregation._id});
        expect(updatedSeedTerritory.findStreet).to.exist;
        let block = updatedSeedTerritory.findStreet('Oakland').findHundred(4500).even;
        expect(block.worked).to.have.lengthOf(1);

      });

    });

  });

  describe('Unit Router /street/:street_name/hundred/:hundred/unit/:unit_number', () => {

    let seedStreet = null;
    let seedHundred = null;
    let seedUnit = null;
    let seedSubunit = null;
    beforeEach(async () => {

      seedStreet = seedTerritory.addStreet('Oakland');
      seedHundred = seedStreet.addHundred(4400);
      seedHundred.addUnits([{number: 4402, subunits: ['Apt 1']}]);
      seedUnit = seedHundred.findUnit(4402);
      seedSubunit = seedUnit.findSubunit('Apt 1');
      await seedTerritory.save();

    });

    describe('/visit', () => {

      it('should add visit to unit', (done) => {

        authenticatedSession
          .post('/ajax/territory/street/Oakland/hundred/4400/unit/4402/visit/add')
          .send({
            visit: {
              contacted_by: 'Julian Hernandez',
              householders_contacted: ['Cosmo Kramer', 'Jerry Seinfeld'],
              details: 'Kramer convinced Jerry to get illegal cable service',
            }
          })
          .expect(200)
          .end((err, res) => {
            if(err) throw err;
            expect(res.body.data).to.have.property('visit');
            expect(res.body.data.visit.contacted_by).to.eql('Julian Hernandez');
            // find unit again
            refreshSeedTerritory()
              .then(() => {
                expect(seedTerritory.findStreet('Oakland').findHundred(4400).findUnit(4402).visits).to.have.lengthOf(1);
                return done();
              })
              .catch(e => {throw e});
          });

      });

      it('should add visit to subunit', (done) => {

        authenticatedSession
          .post('/ajax/territory/street/Oakland/hundred/4400/unit/4402/visit/add?subunit=Apt+1')
          .send({
            visit: {
              contacted_by: 'Julian Hernandez',
              householders_contacted: ['Cosmo Kramer', 'Jerry Seinfeld'],
              details: 'Kramer convinced Jerry to get illegal cable service',
            }
          })
          .expect(200)
          .end((err, res) => {
            if(err) throw err;
            expect(res.body.data).to.have.property('visit');
            expect(res.body.data.visit.contacted_by).to.eql('Julian Hernandez');
            // find unit again
            refreshSeedTerritory()
              .then(() => {
                expect(seedTerritory.findStreet('Oakland').findHundred(4400).findUnit(4402).visits).to.have.lengthOf(0);
                expect(seedTerritory.findStreet('Oakland').findHundred(4400).findUnit(4402).findSubunit('Apt 1').visits).to.have.lengthOf(1);
                return done();
              })
              .catch(e => {throw e});
          });

      });

    });

    describe('/tag', () => {

      it('should add tag to unit', async () => {

        await authenticatedSession
          .post('/ajax/territory/street/Oakland/hundred/4400/unit/4402/tag/add?tag=low+steps')
          .expect(200)
          .expect(async res => {
            expect(res.body.data).to.have.property('tag');
            expect(res.body.data.tag).to.eql('low steps');
            // find unit again
            await refreshSeedTerritory();
            // expect(seedTerritory.findStreet('Oakland').findHundred(4400).findUnit(4402).notes[0]);
            expect(seedTerritory.findStreet('Oakland').findHundred(4400).findUnit(4402).tags).to.include('low steps');
          });

      });

      it('should add tag to subunit', async () => {

        await authenticatedSession
          .post('/ajax/territory/street/Oakland/hundred/4400/unit/4402/tag/add?tag=low+steps&subunit=Apt+1')
          .expect(200)
          .expect(async res => {
            expect(res.body.data).to.have.property('tag');
            expect(res.body.data.tag).to.eql('low steps');
            // find unit again
            await refreshSeedTerritory();
            // expect(seedTerritory.findStreet('Oakland').findHundred(4400).findUnit(4402).notes[0]);
            expect(seedTerritory.findStreet('Oakland').findHundred(4400).findUnit(4402).findSubunit('Apt 1').tags).to.include('low steps');
          });

      });

    });

    describe('/householder', () => {

      it('should add householder to unit', async () => {

        await authenticatedSession
          .post('/ajax/territory/street/Oakland/hundred/4400/unit/4402/householder/add')
          .send({
            householder: {
              name: 'Jerry Seinfeld',
              gender: 'male',
              phone_number: '2123444444',
              email: 'supermanfan123@gmail.com',
            }
          })
          .expect(200)
          .expect(async res => {
            expect(res.body.data).to.have.property('householder');
            expect(res.body.data.householder.name).to.eql('Jerry Seinfeld');
            // find unit again
            await refreshSeedTerritory();
            // expect(seedTerritory.findStreet('Oakland').findHundred(4400).findUnit(4402).notes[0]);
            expect(seedTerritory.findStreet('Oakland').findHundred(4400).findUnit(4402).householders).to.have.lengthOf(1);
          });

      });

      it('should add householder to subunit', async () => {

        await authenticatedSession
          .post('/ajax/territory/street/Oakland/hundred/4400/unit/4402/householder/add?subunit=Apt+1')
          .send({
            householder: {
              name: 'Jerry Seinfeld',
              gender: 'male',
              phone_number: '2123444444',
              email: 'supermanfan123@gmail.com',
            }
          })
          .expect(200)
          .expect(async res => {
            expect(res.body.data).to.have.property('householder');
            expect(res.body.data.householder.name).to.eql('Jerry Seinfeld');
            // find unit again
            await refreshSeedTerritory();
            // expect(seedTerritory.findStreet('Oakland').findHundred(4400).findUnit(4402).notes[0]);
            expect(seedTerritory.findStreet('Oakland').findHundred(4400).findUnit(4402).householders).to.have.lengthOf(0);
            expect(seedTerritory.findStreet('Oakland').findHundred(4400).findUnit(4402).findSubunit('Apt 1').householders).to.have.lengthOf(1);
          });

      });

    });

    describe('/note', () => {

      it('should add note to unit', async () => {

        await authenticatedSession
          .post('/ajax/territory/street/Oakland/hundred/4400/unit/4402/note/add')
          .send({
            note: {
              by: 'Julian Hernandez',
              note: 'This is note',
            }
          })
          .expect(200)
          .expect(async res => {
            expect(res.body.data).to.have.property('note');
            expect(res.body.data.note.by).to.eql('Julian Hernandez');
            expect(res.body.data.note.note).to.eql('This is note');
            // find unit again
            await refreshSeedTerritory();
            // expect(seedTerritory.findStreet('Oakland').findHundred(4400).findUnit(4402).notes[0]);
            expect(seedTerritory.findStreet('Oakland').findHundred(4400).findUnit(4402).notes).to.have.lengthOf(1);
          });

      });

      it('should add note to subunit', async () => {

        await authenticatedSession
          .post('/ajax/territory/street/Oakland/hundred/4400/unit/4402/note/add?subunit=Apt+1')
          .send({
            note: {
              by: 'Julian Hernandez',
              note: 'This is note',
            }
          })
          .expect(200)
          .expect(async res => {
            expect(res.body.data).to.have.property('note');
            expect(res.body.data.note.by).to.eql('Julian Hernandez');
            expect(res.body.data.note.note).to.eql('This is note');
            // find unit again
            await refreshSeedTerritory();
            // expect(seedTerritory.findStreet('Oakland').findHundred(4400).findUnit(4402).notes[0]);
            expect(seedTerritory.findStreet('Oakland').findHundred(4400).findUnit(4402).findSubunit('Apt 1').notes).to.have.lengthOf(1);
            expect(seedTerritory.findStreet('Oakland').findHundred(4400).findUnit(4402).notes).to.have.lengthOf(0);
          });

      });

      it('should respond with 406 for missing note', async () => {

        await authenticatedSession
          .post('/ajax/territory/street/Oakland/hundred/4400/unit/4402/note/add')
          .expect(406);

      });

    });

    describe('/meta', () => {

      it('should set unit as a do not call', async () => {

        await authenticatedSession
          .post('/ajax/territory/street/Oakland/hundred/4400/unit/4402/meta?dnc=true')
          .expect(200)
          .expect(async res => {
            expect(res.body.data).to.have.property('field');
            expect(res.body.data).to.have.property('value');
            expect(res.body.data.field).to.eql('dnc');
            expect(res.body.data.value).to.eql('true');
            // find unit again
            await refreshSeedTerritory();
            expect(seedTerritory.findStreet('Oakland').findHundred(4400).findUnit(4402).isdonotcall).to.be.true;
          });

      });

      it('should set unit language as spanish', async () => {

        await authenticatedSession
          .post('/ajax/territory/street/Oakland/hundred/4400/unit/4402/meta?lang=es')
          .expect(200)
          .expect(async res => {
            expect(res.body.data).to.have.property('field');
            expect(res.body.data).to.have.property('value');
            expect(res.body.data.field).to.eql('lang');
            expect(res.body.data.value).to.eql('es');
            // find unit again
            await refreshSeedTerritory();
            expect(seedTerritory.findStreet('Oakland').findHundred(4400).findUnit(4402).language).to.eql('es');
          });

      });

      it('should set unit as currently being called on', async () => {

        await authenticatedSession
          .post('/ajax/territory/street/Oakland/hundred/4400/unit/4402/meta?calledon=true')
          .expect(200)
          .expect(async res => {
            expect(res.body.data).to.have.property('field');
            expect(res.body.data).to.have.property('value');
            expect(res.body.data.field).to.eql('calledon');
            expect(res.body.data.value).to.eql('true');
            // find unit again
            await refreshSeedTerritory();
            expect(seedTerritory.findStreet('Oakland').findHundred(4400).findUnit(4402).iscalledon).to.be.true;
          });

      });

      it('should set unit name', async () => {

        await authenticatedSession
          .post('/ajax/territory/street/Oakland/hundred/4400/unit/4402/meta?name=Check+Cashing')
          .expect(200)
          .expect(async res => {
            expect(res.body.data).to.have.property('field');
            expect(res.body.data).to.have.property('value');
            expect(res.body.data.field).to.eql('name');
            expect(res.body.data.value).to.eql('Check Cashing');
            // find unit again
            await refreshSeedTerritory();
            expect(seedTerritory.findStreet('Oakland').findHundred(4400).findUnit(4402).name).to.eql('Check Cashing');
          });

      });

    });

  });

});
