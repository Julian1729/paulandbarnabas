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

  describe('POST /save-territory', () => {

    it('should save block', (done) => {

      authenticatedSession
        .post('/ajax/territory/save-territory')
        .send({
          'block_hundred': 1200,
          'odd_even': 'even',
          'units': [{number: 1200}, {number: 1202}],
          'street': 'Tampa',
          'new_street_name': null,
          'fragment_assignment': null,
          'fragment_unassigned': 'on'
        })
        .expect(200)
        .end((err, res) => {
          expect(res.body.data).to.have.property('units_created');
          expect(res.body.data.units_created).to.equal(2);
          refreshSeedTerritory()
            .then(() => {
              expect(seedTerritory.findStreet('Tampa').findHundred(1200).findUnit(1202)).to.exist;
              return done();
            }).catch(e => {throw e});
        });

    });

    it('should save block and assign fragment', async () => {

      seedTerritory.addFragment(2);
      await seedTerritory.save();

      let data = null;

      await authenticatedSession
        .post('/ajax/territory/save-territory')
        .send({
          'block_hundred': 1200,
          'odd_even': 'even',
          'units': [{number: 1200}, {number: 1202}],
          'street': 'Tampa',
          'new_street_name': null,
          'fragment_assignment': 2,
          'fragment_unassigned': 'off'
        })
        .expect(200)
        .expect(res => {
          data = res.body.data;
        });

        expect(data).to.have.property('units_created');
        expect(data.units_created).to.equal(2);
        expect(data).to.have.property('fragment_assignment');
        expect(data.fragment_assignment).to.equal(2);
        await refreshSeedTerritory();
        expect(seedTerritory.findFragment(2).blocks).to.have.lengthOf(1);

    });

  });

  describe('POST /save-fragment', () => {

    it('should save fragment and assign to user', async () => {

      // store res data to assert outside of supertest
      let data = null;

      await authenticatedSession
        .post('/ajax/territory/save-fragment')
        .send({
          fragment: {
            number: 17,
            blocks: [new ObjectId(), new ObjectId(), new ObjectId()],
            assignment: seedUserAdmin._id,
          }
        })
        .expect(200)
        .expect(res => {
          expect(res.body.error).to.be.empty;
          expect(res.body.data).to.have.property('fragment');
          data = res.body.data;
        });

        expect(data.fragment).to.have.property('assignedTo');
        expect(data.fragment.number).to.equal(17);
        expect(data.fragment.blocks).to.equal(3);

        await refreshSeedTerritory();
        expect(seedTerritory.findFragment(17).blocks).to.have.lengthOf(3);
        expect(seedTerritory.findFragment(17).holder()).to.equal(seedUserAdmin._id.toString());

    });

  });

  describe('GET /list/streets', () => {

    it('should retrieve stats for 2 streets', async () => {

      // add street1
      let seedStreet = seedTerritory.addStreet('Overington', {skipExistenceCheck: true});
      let seedHundred1 = seedStreet.addHundred(1200);
      // enter 4 units
      let seedUnits1 = seedHundred1.addUnits([{number: 1202}, {number: 1204}, {number: 1205}, {number: 1206, subunits: ['Apt 1', 'Apt 2']}]);
      let seedHundred2 = seedStreet.addHundred(1300);
      // enter 2 units
      let seedUnits2 = seedHundred2.addUnits([{number: 1302}, {number: 1204}]);
      // add street2
      let seedStreet2 = seedTerritory.addStreet('Naples', {skipExistenceCheck: true});
      let seedHundred3 = seedStreet2.addHundred(1200);
      // enter 4 units
      let seedUnits3 = seedHundred3.addUnits([{number: 1202}, {number: 1204}, {number: 1205}, {number: 1206, subunits: ['Apt 1', 'Apt 2']}]);
      let seedHundred4 = seedStreet2.addHundred(1300);
      // enter 2 units
      let seedUnits4 = seedHundred4.addUnits([{number: 1302}, {number: 1204}]);

      await seedTerritory.save();

      await authenticatedSession
        .get('/ajax/territory/list/streets')
        .expect(200)
        .expect(res => {
          expect(res.body.data.streets).to.eql(          [
            {
              name: 'Overington',
              totals: {
                hundreds: 2,
                units: 6
              },
              hundreds: {
                '1200': {
                  even_count: 3,
                  odd_count: 1
                },
                '1300': {
                  even_count: 2,
                  odd_count: 0
                }
              }
            },
            {
              name: 'Naples',
              totals: {
                hundreds: 2,
                units: 6
              },
              hundreds: {
                '1200': {
                  even_count: 3,
                  odd_count: 1
                },
                '1300': {
                  even_count: 2,
                  odd_count: 0
                }
              }
            }
          ])
        });

    });

  });

  describe('GET /list/fragments', () => {

    it('should retrieve stats for 2 streets', async () => {

      let seedFragment = seedTerritory.addFragment(35);
      // enter 3 ids as block ids
      seedFragment.assignBlocks([new ObjectId(), new ObjectId(), new ObjectId()], seedTerritory);
      seedFragment.assignHolder(seedUserAdmin._id);
      // seed second fragment
      let seedFragment2 = seedTerritory.addFragment(36);
      // enter 3 ids as block ids
      seedFragment2.assignBlocks([new ObjectId()], seedTerritory);
      seedFragment2.assignHolder(seedUserAdmin._id);

      await seedTerritory.save();

      await authenticatedSession
        .get('/ajax/territory/list/fragments')
        .expect(200)
        .expect(res => {
          expect(res.body.data.fragments).to.eql(
            [
              {
                number: 35,
                blocks: 3,
                holder: {
                  name: `${seedUserAdmin.first_name} ${seedUserAdmin.last_name}`,
                  title: seedUserAdmin.title,
                  id: seedUserAdmin._id.toString()
                }
              },
              {
                number: 36,
                blocks: 1,
                holder: {
                  name: `${seedUserAdmin.first_name} ${seedUserAdmin.last_name}`,
                  title: seedUserAdmin.title,
                  id: seedUserAdmin._id.toString()
                }
              }
            ]
          )
        });

    }, 5000);

  });

  describe('GET /fragment/:fragment_number/stats', () => {

    it('should get stats for one fragment', async () => {

      // create seed user and enter seed fragment into territory
      let seedFragment = seedTerritory.addFragment(17);
      // enter 3 ids as block ids
      seedFragment.assignBlocks([new ObjectId(), new ObjectId(), new ObjectId()], seedTerritory);
      seedFragment.assignHolder(seedUserAdmin._id);
      await seedTerritory.save();

      await authenticatedSession
        .get('/ajax/territory/fragment/17/stats')
        .expect(200)
        .expect(res => {
          expect(res.body.data).to.have.property('stats');
          expect(res.body.data.stats).to.eql({
            number: 17,
            blocks: 3,
            holder: {
              name: `${seedUserAdmin.first_name} ${seedUserAdmin.last_name}`,
              title: seedUserAdmin.title,
              id: seedUserAdmin._id.toString()
            }
          });
        });

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

      describe('/add', () => {

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

      describe('/remove', () => {

        it('should remove visit from unit', async () => {

          let seedVisit = seedUnit.addVisit({
            householders_contacted: ['Michael', 'Dwight'],
            contacted_by: 'Jan Levenson Gould',
            details: 'Dwight is preparing Michael for Jans baby',
            timestamp: new Date().getTime(),
          });

          await seedTerritory.save();

          await authenticatedSession
            .post(`/ajax/territory/street/Oakland/hundred/4400/unit/4402/visit/remove?id=${seedVisit.id.toString()}`)
            .expect(200)
            .expect(res => {
              expect(res.body.data).to.have.property('visit');
              expect(res.body.data.visit.contacted_by).to.eql('Jan Levenson Gould');
              // find unit again
              refreshSeedTerritory()
                .then(() => {
                  expect(seedTerritory.findStreet('Oakland').findHundred(4400).findUnit(4402).visits).to.have.lengthOf(0);
                })
                .catch(e => {
                  throw e;
                });
            });

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
