const {expect} = require('chai');
const session = require('supertest-session');
var languageAbbreviations = require('iso-639-2-english').living;

const {app} = require('../app');
const seed_data = require('../dev/seed/data');
const user_seed_data = require('../dev/seed/User');
const TerritoryModel = require('../models/Territory');

var testSession = null;

/**
 * Seed Database
 * @return {Promise}
 */
var seed = () => {
  return require('../dev/seed/populate')(true);
};

describe('Territory Rajax', () => {

  // seed db before running tests
  before(done => {
    seed().then(done).catch(e => done(e));
  });

  var authenticatedSession;
  beforeEach(done => {
    initSession = session(app);
    initSession.post('/ajax/account/login')
    // use unhashed user seed data
      .send({email: user_seed_data[0].email, password: user_seed_data[0].password}).expect(200).end(function(err) {
      if (err)
        return done(err);
      authenticatedSession = initSession;
      return done();
    });
  });

  it('should find user territory', function(done) {
    authenticatedSession.get('/rajax/territory/test').expect(200).end(done);
  });

  describe('Street Router', () => {

    it('should find Oakland street', (done) => {

      authenticatedSession.get('/rajax/territory/street/Oakland/test').expect(200).end((err, res) => {
        if (err)
          console.log(err.stack);
        expect(res.body.street.name).to.equal('Oakland');
        done();
      });

    });

    // FIXME: this should pass, findStreet methods needs to made case insenstive
    // it('should find Oakland street w/lowercase', (done) => {
    //
    //   authenticatedSession
    //     .get('/rajax/territory/street/oakland/test')
    //     .expect(200)
    //     .end((err, res) => {
    //       if(err) console.log(err.stack);
    //       expect(res.body.street.name).to.equal('Oakland');
    //       done();
    //     });
    //
    // });

    // it('should remove a street', (done) => {
    //
    // });

    describe('Hundred Router', () => {

      let hundred_base_url = '/rajax/territory/street/Oakland/hundred';

      it('should find 4500 Oakland', (done) => {

        authenticatedSession.get(`${hundred_base_url}/4500/test`).expect(200).end(done);

      });

      it('should add 3 units to 4500', (done) => {

        let data = {
          units: [
            {
              number: 4515
            }, {
              number: 4517
            }, {
              number: 4518,
              subunits: ['Apt 1', 'Apt 2', 'Apt 3']
            }
          ]
        };
        let json = JSON.stringify(data);
        authenticatedSession.post(`${hundred_base_url}/4500/units/add`)
        .set('Content-Type', 'application/json')
        .send(json)
        .expect(200)
        .end((err, res) => {
          if (err)
            return done(err);

          expect(res.body.summary.units_added).to.equal(3);
          done();

        });

      });

      it('should not add units to 4500 Oakland and return UnitsAlreadyExist error obj', (done) => {

        let data = {
          units: [
            {
              number: 4501
            }, {
              number: 4503
            }, {
              number: 4505,
              subunits: ['Apt 1', 'Apt 2', 'Apt 3']
            }
          ]
        };

        let json = JSON.stringify(data);

        authenticatedSession.post(`${hundred_base_url}/4500/units/add`)
        // these units already exist
          .set('Content-Type', 'application/json')
          .send(json)
          .expect(200)
          .end((err, res) => {
          if (err)
            return done(err);

          expect(res.body.summary.units_added).to.equal(0);
          expect(res.body.error).to.have.property('duplicateNumbers');
          expect(res.body.error.duplicateNumbers).to.have.include(4501, 4503, 4505);
          done();

        });

      });

      it('should overwrite 3 units in 4500 Oakland', (done) => {

        let data = {
          units: [
            {
              number: 4501
            }, {
              number: 4503
            }, {
              number: 4505,
              subunits: ['Apt 1', 'Apt 2', 'Apt 3']
            }
          ]
        };

        let json = JSON.stringify(data);

        authenticatedSession.post(`${hundred_base_url}/4500/units/add?overwriteduplicates=true`)
        // these units already exist
          .set('Content-Type', 'application/json')
          .send(json)
          .expect(200)
          .end((err, res) => {
          if (err)
            return done(err);

          expect(res.body.summary.units_added).to.equal(3);
          done();

        });

      });

      it('should skip adding 3 units in 4500 Oakland', (done) => {

        let data = {
          units: [
            {
              number: 4501
            }, {
              number: 4503
            }, {
              number: 4505,
              subunits: ['Apt 1', 'Apt 2', 'Apt 3']
            }
          ]
        };

        let json = JSON.stringify(data);

        authenticatedSession.post(`${hundred_base_url}/4500/units/add?skipduplicates=true`)
        // these units already exist
          .set('Content-Type', 'application/json')
          .send(json)
          .expect(200)
          .end((err, res) => {
          if (err)
            return done(err);

          expect(res.body.summary.units_added).to.equal(0);
          done();

        });

      });

      describe('Block Router', () => {

        let block_base_url = '/rajax/territory/street/Oakland/hundred/4500/block';

        it('should find correct block', (done) => {

          authenticatedSession.get(`${block_base_url}/odd/test`).expect(200).end(done);

        });

        it('should add tag to 4500 Oakland odd', (done) => {

          authenticatedSession.post(`${block_base_url}/odd/tag/add?tag=low+steps`).expect(200).end(done)

        });

        it(`should remove 'low steps' tag from 4500 Oakland odd`, (done) => {

          (async () => {
            await authenticatedSession.post(`${block_base_url}/odd/tag/add?tag=low+steps`).expect(200);
          })();

          (async () => {
            await authenticatedSession.post(`${block_base_url}/odd/tag/remove?tag=low+steps`).expect(200)
          })();

          done();

        });

        // manually verified (by looking at db)
        it('should add a worked record', (done) => {

          authenticatedSession.post(`${block_base_url}/odd/worked`).expect(200).end(done);

        });

        // manually verified
        it('should add a worked record with specified timestamp', (done) => {

          let time = new Date('05-07-1998').getTime();
          authenticatedSession.post(`${block_base_url}/odd/worked?time=${time}`).expect(200).end(done);

        });

      });

      describe('Unit Router', () => {

        let unit_base_url = `/rajax/territory/street/Oakland/hundred/4500/unit`;

        it('should find unit', (done) => {

          authenticatedSession.get(`${unit_base_url}/4502/test`).expect(200).end(done);

        });

        it('should find subunit', (done) => {

          authenticatedSession.get(`${unit_base_url}/4505/test?subunit=Apt+1`).expect(200).end(done);

        });

        describe('POST /visit', () => {

          let visitIdToEdit = null;

          it('should add a visit', (done) => {

            let data = {

              householders_contacted: [
                'Chandler Bing', 'Joey Tribbiani'
              ],

              contacted_by: 'Velma Jeter',

              details: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Suspendisse sit amet enim tristique, lacinia tortor ut, maximus dolor.
                Proin dapibus facilisis lacinia. Morbi hendrerit dolor non metus auctor pharetra.
                Maecenas in augue blandit, pharetra metus nec, vulputate ligula. Nulla gravida accumsan odio.`,

              timestamp: 1000251000,

              id: null

            };

            let json = JSON.stringify(data);

            authenticatedSession.post(`${unit_base_url}/4502/visit/add`)
              .set('Content-Type', 'application/json')
              .send(json)
              .expect(200)
              .end((err, res) => {
                if (err)
                  throw err;
                expect(res.body.data.id).to.exist;
                TerritoryModel.findByCongregation(seed_data.congregations[0]._id).then(territory => {
                  let oakland = territory.findStreet('Oakland');;
                  let hundred = oakland.findHundred(4500);
                  let unit = hundred.findUnit(4502);
                  expect(unit.visits).to.have.lengthOf(1);
                  visitIdToEdit = res.body.data.id;
                  return done();
                }).catch(e => done(e));

              });

          });

          it('should add a visit to subunit (4505 Oakland Apt 1)', (done) => {

            let data = {

              householders_contacted: [
                'Chandler Bing', 'Joey Tribbiani'
              ],

              contacted_by: 'Velma Jeter',

              details: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Suspendisse sit amet enim tristique, lacinia tortor ut, maximus dolor.
                Proin dapibus facilisis lacinia. Morbi hendrerit dolor non metus auctor pharetra.
                Maecenas in augue blandit, pharetra metus nec, vulputate ligula. Nulla gravida accumsan odio.`,

              timestamp: 1000251000,

              id: null

            };

            let json = JSON.stringify(data);

            authenticatedSession.post(`${unit_base_url}/4505/visit/add?subunit=Apt+1`)
              .set('Content-Type', 'application/json')
              .send(json)
              .expect(200)
              .end((err, res) => {
                if (err)
                  throw err;
                TerritoryModel.findByCongregation(seed_data.congregations[0]._id).then(territory => {
                  let oakland = territory.findStreet('Oakland');;
                  let hundred = oakland.findHundred(4500);
                  let unit = hundred.findUnit(4505);
                  let subunit = unit.findSubunit('Apt 1');
                  expect(subunit.visits).to.have.lengthOf(1);
                  return done();
                }).catch(e => done(e));
              });

          });

          // FIXME: this is poor unit testing because this test
          // relies on the test before passing. Due to an error for
          // makign two calls in one test this approach was taken
          it('should edit added visit', (done) => {

            let data = {
              householders_contacted: ['Monica Gellert'],
              contacted_by: 'Brittany Alston',
              details: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Suspendisse sit amet enim tristique, lacinia tortor ut, maximus dolor.
              Proin dapibus facilisis lacinia. Morbi hendrerit dolor non metus auctor pharetra.
              Maecenas in augue blandit, pharetra metus nec, vulputate ligula. Nulla gravida accumsan odio.`,
              timestamp: 1000251000, id: visitIdToEdit
            };

            let json = JSON.stringify(data);

            authenticatedSession.post(`${unit_base_url}/4502/visit/add`)
              .set('Content-Type', 'application/json')
              .send(json)
              .expect(200)
              .end((err, res) => {
                if (err)
                  throw err;

                // have to check that changes were made here
                TerritoryModel.findByCongregation(seed_data.congregations[0]._id).then(territory => {
                  let oakland = territory.findStreet('Oakland');;
                  let hundred = oakland.findHundred(4500);
                  let unit = hundred.findUnit(4502);
                  expect(unit.visits).to.have.lengthOf(1);
                  expect(unit.visits[0].householders_contacted).to.not.include('Chandler Bing');
                  expect(unit.visits[0].contacted_by).to.equal('Brittany Alston');
                  return done();
                }).catch(e => done(e));
              });

          });

          it('should remove visit from unit', (done) => {

            authenticatedSession.post(`${unit_base_url}/4502/visit/remove?id=${visitIdToEdit.toString()}`).expect(200).end((err, res) => {
              if (err)
                return console.log(err.stack);
              TerritoryModel.findByCongregation(seed_data.congregations[0]._id).then(territory => {
                let oakland = territory.findStreet('Oakland');;
                let hundred = oakland.findHundred(4500);
                let unit = hundred.findUnit(4502);
                expect(unit.visits).to.have.lengthOf(0);
                return done();
              }).catch(e => done(e));
            });

          });

        });

        describe('POST /subunit', () => {

          let subunitId = null;

          it('should add 2 subunits to 4507 Oakland', (done) => {

            let data = {
              subunits: [
                {
                  name: 'Apt 1'
                }, {
                  name: 'Apt 2'
                }
              ]
            };

            let json = JSON.stringify(data);

            authenticatedSession.post(`${unit_base_url}/4507/subunit/add`)
              .set('Content-Type', 'application/json')
              .send(json)
              .expect(200)
              .end((err, res) => {
                if (err)
                  throw err;
                expect(res.body.data.subunits).to.exist;
                expect(res.body.data.subunits).to.have.lengthOf(2);
                // WARNING: bad practice!
                // set first subunit to var to be removed in next test
                subunitId = res.body.data.subunits[0]._id;
                TerritoryModel.findByCongregation(seed_data.congregations[0]._id).then(territory => {
                  let oakland = territory.findStreet('Oakland');
                  let hundred = oakland.findHundred(4500);
                  let unit = hundred.findUnit(4507);
                  expect(unit.subunits).to.have.lengthOf(2);
                  return done();
                }).catch(e => done(e));
              });

          });

          // WARNING: this is bad practice because this test depends on
          // the test immediately before it to pass
          it('should remove 1 subunit from 4507 Oakland', (done) => {

            authenticatedSession.post(`${unit_base_url}/4507/subunit/remove?id=${subunitId.toString()}`).expect(200).end((err, res) => {
              if (err)
                throw err;
              TerritoryModel.findByCongregation(seed_data.congregations[0]._id).then(territory => {
                let oakland = territory.findStreet('Oakland');
                let hundred = oakland.findHundred(4500);
                let unit = hundred.findUnit(4507);
                expect(unit.subunits).to.have.lengthOf(1);
                return done();
              }).catch(e => done(e));
            });

          });

        });

        describe('POST /tag', () => {

          it('should add a tag to unit (4501 Oakland)', (done) => {

            authenticatedSession.post(`${unit_base_url}/4501/tag/add?tag=low+steps`).expect(200).end((err, res) => {
              if (err)
                throw err;
              TerritoryModel.findByCongregation(seed_data.congregations[0]._id).then(territory => {
                let oakland = territory.findStreet('Oakland');
                let hundred = oakland.findHundred(4500);
                let unit = hundred.findUnit(4501);
                expect(unit.tags).to.have.lengthOf(1);
                expect(unit.tags).to.include('low steps');
                return done();
              }).catch(e => done(e));
            });

          });

          it('should add a tag to subunit (4505 Oakland > Apt 1)', (done) => {

            authenticatedSession.post(`${unit_base_url}/4505/tag/add?subunit=Apt+1&tag=low+steps`).expect(200).end((err, res) => {
              if (err)
                throw err;
              TerritoryModel.findByCongregation(seed_data.congregations[0]._id).then(territory => {
                let oakland = territory.findStreet('Oakland');
                let hundred = oakland.findHundred(4500);
                let unit = hundred.findUnit(4505);
                let subunit = unit.findSubunit('Apt 1');
                expect(subunit.tags).to.have.lengthOf(1);
                expect(subunit.tags).to.include('low steps');
                return done();
              }).catch(e => done(e));
            });

          });

          // WARNING: Bad practice, this test depends on previous test to pass
          it('should remove a tag from unit (4501 Oakland)', (done) => {

            authenticatedSession.post(`${unit_base_url}/4501/tag/remove?tag=low+steps`).expect(200).end((err, res) => {
              if (err)
                throw err;
              TerritoryModel.findByCongregation(seed_data.congregations[0]._id).then(territory => {
                let oakland = territory.findStreet('Oakland');
                let hundred = oakland.findHundred(4500);
                let unit = hundred.findUnit(4501);
                expect(unit.tags).to.have.lengthOf(0);
                return done();
              }).catch(e => done(e));
            });

          });

        });

        describe('POST /householder', () => {

          let householderToRemove = null;

          it('should add a householder to unit (4505 Oakland)', (done) => {

            let data = {
              householder: {
                name: 'Johnathan Doe',
                gender: 'male'
              }
            };

            let json = JSON.stringify(data);

            authenticatedSession.post(`${unit_base_url}/4505/householder/add`)
              .set('Content-Type', 'application/json')
              .send(json)
              .expect(200)
              .end((err, res) => {
                if (err)
                  throw err;
                expect(res.body.data.householder._id).to.exist;
                // set this housholder's id to be removed
                householderToRemove = res.body.data.householder._id;
                TerritoryModel.findByCongregation(seed_data.congregations[0]._id).then(territory => {
                  let oakland = territory.findStreet('Oakland');
                  let hundred = oakland.findHundred(4500);
                  let unit = hundred.findUnit(4505);
                  expect(unit.householders).to.have.lengthOf(1);
                  expect(unit.householders[0].name).to.equal('Johnathan Doe');
                  return done();
                }).catch(e => done(e));
              });

          });

          it('should add a householder to subunit (4505 Oakland > Apt 1)', (done) => {

            let data = {
              householder: {
                name: 'Johnathan Doe',
                gender: 'male'
              }
            };

            let json = JSON.stringify(data);

            authenticatedSession.post(`${unit_base_url}/4505/householder/add?subunit=Apt+1`)
              .set('Content-Type', 'application/json')
              .send(json)
              .expect(200)
              .end((err, res) => {
                if (err)
                  throw err;
                expect(res.body.data.householder._id).to.exist;
                TerritoryModel.findByCongregation(seed_data.congregations[0]._id).then(territory => {
                  let oakland = territory.findStreet('Oakland');
                  let hundred = oakland.findHundred(4500);
                  let unit = hundred.findUnit(4505);
                  let subunit = unit.findSubunit('Apt 1');
                  expect(subunit.householders).to.have.lengthOf(1);
                  expect(subunit.householders[0].name).to.equal('Johnathan Doe');
                  return done();
                }).catch(e => done(e));
              });

          });

          it('should remove a householder from unit (4505 Oakland)', (done) => {

            let data = {
              householder: {
                name: 'Johnathan Doe',
                gender: 'male'
              }
            };

            let json = JSON.stringify(data);

            authenticatedSession.post(`${unit_base_url}/4505/householder/remove?id=${householderToRemove.toString()}`)
              .set('Content-Type', 'application/json')
              .send(json)
              .expect(200)
              .end((err, res) => {
                if (err)
                  throw err;
                TerritoryModel.findByCongregation(seed_data.congregations[0]._id).then(territory => {
                  let oakland = territory.findStreet('Oakland');
                  let hundred = oakland.findHundred(4500);
                  let unit = hundred.findUnit(4505);
                  expect(unit.householders).to.have.lengthOf(0);
                  return done();
                }).catch(e => done(e));
              });

          });

        });

        describe('POST /note', () => {

          let noteToRemove = null;

          it('should add a note to unit (4504 Oakland)', (done) => {

            let data = {note: 'Lorem ipsum dolor sit amet', by: 'Dorothy Johnson'};

            let json = JSON.stringify(data);

            authenticatedSession.post(`${unit_base_url}/4504/note/add`)
              .set('Content-Type', 'application/json')
              .send(json)
              .expect(200)
              .end((err, res) => {
                if (err)
                  throw err;
                expect(res.body.data.note).to.exist;
                // set this note's id to be removed
                noteToRemove = res.body.data.note._id;
                TerritoryModel.findByCongregation(seed_data.congregations[0]._id).then(territory => {
                  let oakland = territory.findStreet('Oakland');
                  let hundred = oakland.findHundred(4500);
                  let unit = hundred.findUnit(4504);
                  expect(unit.notes).to.have.lengthOf(1);
                  return done();
                }).catch(e => done(e));
              });

          });

          it('should add a note to subunit (4505 Oakland > Apt 2)', (done) => {

            let data = {note: 'Lorem ipsum dolor sit amet', by: 'Dorothy Johnson'};

            let json = JSON.stringify(data);

            authenticatedSession.post(`${unit_base_url}/4505/note/add?subunit=Apt+2`)
              .set('Content-Type', 'application/json')
              .send(json)
              .expect(200)
              .end((err, res) => {
                if (err)
                  throw err;
                expect(res.body.data.note).to.exist;
                TerritoryModel.findByCongregation(seed_data.congregations[0]._id).then(territory => {
                  let oakland = territory.findStreet('Oakland');
                  let hundred = oakland.findHundred(4500);
                  let unit = hundred.findUnit(4505);
                  let subunit = unit.findSubunit('Apt 2');
                  expect(subunit.notes).to.have.lengthOf(1);
                  return done();
                }).catch(e => done(e));
              });

          });

          it('should remove a note from unit (4504 Oakland)', (done) => {

            authenticatedSession.post(`${unit_base_url}/4504/note/remove?id=${noteToRemove.toString()}`).expect(200).end((err, res) => {
              if (err)
                throw err;
              TerritoryModel.findByCongregation(seed_data.congregations[0]._id).then(territory => {
                let oakland = territory.findStreet('Oakland');
                let hundred = oakland.findHundred(4500);
                let unit = hundred.findUnit(4504);
                expect(unit.notes).to.have.lengthOf(0);
                return done();
              }).catch(e => done(e));
            });

          });

        });

        describe('POST /meta', () => {

          it('should mark unit as a do not call (4501 Oakland)', (done) => {

            authenticatedSession.post(`${unit_base_url}/4501/meta?dnc=1`).expect(200).end((err, res) => {
              if (err)
                throw err;
              TerritoryModel.findByCongregation(seed_data.congregations[0]._id).then(territory => {
                let oakland = territory.findStreet('Oakland');
                let hundred = oakland.findHundred(4500);
                let unit = hundred.findUnit(4501);
                expect(unit.isdonotcall).to.equal(true);
                return done();
              }).catch(e => done(e));
            });

          });

          it('should mark unit as no longer do not call (4501 Oakland)', (done) => {

            authenticatedSession.post(`${unit_base_url}/4501/meta?dnc=0`).expect(200).end((err, res) => {
              if (err)
                throw err;
              TerritoryModel.findByCongregation(seed_data.congregations[0]._id).then(territory => {
                let oakland = territory.findStreet('Oakland');
                let hundred = oakland.findHundred(4500);
                let unit = hundred.findUnit(4501);
                expect(unit.isdonotcall).to.equal(false);
                return done();
              }).catch(e => done(e));
            });

          });

          it('should mark subunit as a do not call (4505 Oakland > Apt 1)', (done) => {

            authenticatedSession.post(`${unit_base_url}/4505/meta?dnc=1&subunit=Apt+1`).expect(200).end((err, res) => {
              if (err)
                throw err;
              TerritoryModel.findByCongregation(seed_data.congregations[0]._id).then(territory => {
                let oakland = territory.findStreet('Oakland');
                let hundred = oakland.findHundred(4500);
                let unit = hundred.findUnit(4505);
                let subunit = unit.findSubunit('Apt 1');
                expect(subunit.isdonotcall).to.equal(true);
                return done();
              }).catch(e => done(e));
            });

          });

          it('should mark unit being called on (4502 Oakland)', (done) => {

            authenticatedSession.post(`${unit_base_url}/4502/meta?calledon=1`).expect(200).end((err, res) => {
              if (err)
                throw err;
              TerritoryModel.findByCongregation(seed_data.congregations[0]._id).then(territory => {
                let oakland = territory.findStreet('Oakland');
                let hundred = oakland.findHundred(4500);
                let unit = hundred.findUnit(4502);
                expect(unit.iscalledon).to.equal(true);
                return done();
              }).catch(e => done(e));
            });

          });

          it('should mark unit as no longer being called on (4502 Oakland)', (done) => {

            authenticatedSession.post(`${unit_base_url}/4502/meta?calledon=0`).expect(200).end((err, res) => {
              if (err)
                throw err;
              TerritoryModel.findByCongregation(seed_data.congregations[0]._id).then(territory => {
                let oakland = territory.findStreet('Oakland');
                let hundred = oakland.findHundred(4500);
                let unit = hundred.findUnit(4502);
                expect(unit.iscalledon).to.equal(false);
                return done();
              }).catch(e => done(e));
            });

          });

          it('should set unit name (4502 Oakland)', (done) => {

            authenticatedSession.post(`${unit_base_url}/4502/meta?name=Oxford+Diner`).expect(200).end((err, res) => {
              if (err)
                throw err;
              TerritoryModel.findByCongregation(seed_data.congregations[0]._id).then(territory => {
                let oakland = territory.findStreet('Oakland');
                let hundred = oakland.findHundred(4500);
                let unit = hundred.findUnit(4502);
                expect(unit.name).to.equal('Oxford Diner');
                return done();
              }).catch(e => done(e));
            });

          });

          it('should rename subunit (4505 Oakland > Apt 2)', (done) => {

            authenticatedSession.post(`${unit_base_url}/4505/meta?name=Floor+2&subunit=Apt+2`).expect(200).end((err, res) => {
              if (err)
                throw err;
              TerritoryModel.findByCongregation(seed_data.congregations[0]._id).then(territory => {
                let oakland = territory.findStreet('Oakland');
                let hundred = oakland.findHundred(4500);
                let unit = hundred.findUnit(4505);
                expect(unit.findSubunit('Floor 2')).to.exist;
                return done();
              }).catch(e => done(e));
            });

          });

          it('should set unit language to spanish [sp] (4502 Oakland)', (done) => {

            authenticatedSession
              .post(`${unit_base_url}/4502/meta?lang=spa`)
              .expect(200)
              .end((err, res) => {
                if (err)
                  throw err;
                TerritoryModel.findByCongregation(seed_data.congregations[0]._id).then(territory => {
                  let oakland = territory.findStreet('Oakland');
                  let hundred = oakland.findHundred(4500);
                  let unit = hundred.findUnit(4502);
                  expect(unit.language).to.equal('spa');
                  expect(languageAbbreviations[unit.language]).to.equal('Spanish');
                  return done();
                }).catch(e => done(e));
              });

          });

        });

      });

    });

  });

});
