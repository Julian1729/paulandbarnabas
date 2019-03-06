const {expect} = require('chai');
const _ = require('lodash');
const request = require('supertest');
const session = require('supertest-session');

const TerritoryModel = require('../models/Territory');
const territorySeed = require('./seed/Territory');
const {seedDatabase} = require('./functions.js');
const UserModel = require('../models/User');
const TestUser = require('../dev/seed/User')[0];
const Utils = require('../utils/utils');
const {app} = require('../app');

describe('Territory Ajax', () => {

  describe('Create Territory page', () => {

    var authenticatedSession;

    var data = null;

    before(function (done) {
      seedDatabase(done, data);
    });

    beforeEach(function(done){
      testSession = session(app);
      testSession.post('/ajax/account/login')
        .send({ email: TestUser.email, password: TestUser.password})
        .expect(200)
        .end(function (err) {
          if (err) return done(err);
          authenticatedSession = testSession;
          return done();
        });
    });

    var FormData = {
      block_hundred: '3500',
      odd_even: 'even',
      units: [
        { number: '3500' },
        {
          number: 3502,
          subunits: [
            'Apt 1', 'Apt 2'
          ]
        },
        { number: 3504 },
        { number: 3506 },
        { number: 3508 },
        { number: 3510 },
        { number: 3512 },
        { number: 3514 },
        { number: 3516 },
        { number: 3518 },
        { number: 3520 },
        { number: 3522 },
        { number: 3524 },
        { number: 3526 },
        { number: 3528 },
        { number: 3530 },
        { number: 3532 },
        { number: 3534 },
        { number: 3536 },
        { number: 3538 },
        { number: 3540 },
        { number: 3542 },
        { number: 3544 },
        { number: 3546 },
        { number: 3548 },
        { number: 3550 }
      ],
      street: 'Wakeling',
      new_street_name: null,
      fragment_assignment: '1',
      fragment_unassigned: null
    };

    it('should save a territory', (done) => {

      authenticatedSession
        .get('/ajax/territory/save-territory')
        .send(FormData)
        .expect(200)
        .end((e, r) => {
          var parsedResponse = JSON.parse(r.text);
          expect(parsedResponse).to.have.property('territorySaved');
          done();
        });

    });

    it('should not save territory with no session', (done) => {
      request(app)
        .get('/ajax/territory/save-territory')
        //.send(FormData)
        .expect(401)
        .end((e, r) => {
          var parsedResponse = JSON.parse(r.text);
          expect(parsedResponse).to.have.property('error');
          expect(parsedResponse.error.name).to.equal('SessionUnauthenticated');
          done();
        });
    });

  });

});
