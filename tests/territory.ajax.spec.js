const {expect} = require('chai');
const _ = require('lodash');
const request = require('supertest');

const TerritoryModel = require('../models/Territory');
const territorySeed = require('./seed/Territory');
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

    it('should find congregation territory', (done) => {

      // enter territory into DB
      var testTerritory = TerritoryModel(territorySeed.territory.completed);
      testTerritory.save()
        .then(territory => {

          request(app)
            .post('/ajax/territory/get-blocks')
            .send({
              congregation: territory.congregation,
              street: 'Oakland'
            })
            .expect(200)
            .end((err, res) => {
              var ajaxResponse = JSON.parse(res.text);
              expect(ajaxResponse).to.have.property('data');
              expect(ajaxResponse.data).to.have.property('odd');
              expect(ajaxResponse.data).to.have.property('even');
              done();
            });

        })
        .catch(e => done(e));

    });

  });

});
