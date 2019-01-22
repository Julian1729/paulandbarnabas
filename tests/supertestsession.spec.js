var session = require('supertest-session');
const {app} = require('../app');
const Utils = require('../utils/utils');
const UserModel = require('../models/User');
const TestUser = require('../dev/seed/User')[0];
const {seedDatabase} = require('./functions.js');

const request = require('supertest');



describe('after authenticating session', function () {

  var testSession = null;
  var authenticatedSession;

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




  before(function (done) {

    var data = null;

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

  // it('should not access restricted page', function (done) {
  //   request(app)
  //     .get('/dashboard')
  //     .expect(302, done);
  // });
  //
  // it('should set session on ajax call', (done) => {
  //   authenticatedSession
  //     .post('/ajax/territory/save-territory')
  //     //.send(FormData)
  //     .expect(200)
  //     .end((e, r) => {
  //       console.log(r.text);
  //       return done();
  //     });
  //
  // });



});
