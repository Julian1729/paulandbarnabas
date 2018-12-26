const {expect} = require('chai');
const _ = require('lodash');
const request = require('supertest');
const session = require('supertest-session');

const TerritoryModel = require('../models/Territory');
const territorySeed = require('./seed/Territory');
const UserSeed = require('./seed/User');
const UserModel = require('../models/User');
const Utils = require('../utils/utils');
const app = require('../app');

describe('Territory Ajax', () => {

  /**
   * Clear Territory collection before every test
   */
  beforeEach((done) => {
    // remove all territories from db before running test
    Utils.clearCollection(TerritoryModel).then(() => done()).catch((e) => done(e));
  });

  describe('get blocks action', () => {

    var authenticatedSession;

    beforeEach(done => {

      Utils.clearCollection(UserModel).then(() => {
        // enter valid user into db
        var user = new UserModel(UserSeed.completeUser);
        user.save()
          .then( user => {

            var authAttempt = session(app);
            authAttempt
              .post('/ajax/account/login')
              .send({
                email: UserSeed.completeUser.email,
                password: UserSeed.completeUser.password
              })
              .expect(200)
              .end(err => {
                if(err) return done(err);
                authenticatedSession = authAttempt;
                return done();
              });

          })
          .catch( e => done(e) );
      }).catch(e => done(e));

    });

    // it('should find congregation territory', (done) => {
    //
    //   // enter territory into DB
    //   var testTerritory = TerritoryModel(territorySeed.territory.completed);
    //   testTerritory.save()
    //     .then(territory => {
    //
    //       authenticatedSession
    //         .post('/ajax/territory/get-blocks')
    //         .send({
    //           street: 'Oakland'
    //         })
    //         .expect(200)
    //         .end((err, res) => {
    //           var ajaxResponse = JSON.parse(res.text);
    //           expect(ajaxResponse).to.have.property('data');
    //           expect(ajaxResponse.data).to.have.property('odd');
    //           expect(ajaxResponse.data).to.have.property('even');
    //           done();
    //         });
    //
    //     })
    //     .catch(e => done(e));
    //
    // });
    //
    // it('should return all streets', (done) => {
    //
    //   // enter territory into DB
    //   var testTerritory = TerritoryModel(territorySeed.territory.completed);
    //   // add another street
    //   testTerritory.streets.push({name: 'Wakeling'})
    //   testTerritory.save()
    //     .then(territory => {
    //
    //       authenticatedSession
    //         .post('/ajax/territory/get-streets')
    //         .expect(200)
    //         .end((err, res) => {
    //           var ajaxResponse = JSON.parse(res.text);
    //           expect(ajaxResponse).to.have.property('data');
    //           expect(ajaxResponse.status).to.equal(200);
    //           expect(ajaxResponse.data).to.have.lengthOf(2);
    //           done();
    //         });
    //
    //     })
    //     .catch(e => done(e));
    //
    // });

  });

});
