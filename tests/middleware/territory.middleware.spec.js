const sinon = require('sinon');
const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const {ObjectId} = require('mongodb');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const HttpStatus = require('http-status-codes');
const {mockResponse, mockRequest} = require('mock-req-res');
const appRoot = require('app-root-path');

const errors = require(`${appRoot}/errors`);
const {territoryMiddleware} = require(`${appRoot}/middleware`);
const {Session, helpers} = require(`${appRoot}/utils`);
const userSeed = require(`${appRoot}/tests/seed/user.seed`);
const territorySeed = require(`${appRoot}/tests/seed/territory.seed`);
const {TerritoryModel, CongregationModel} = require(`${appRoot}/models`);
const congregationSeed = require(`${appRoot}/tests/seed/congregation.seed`);

describe('Territory Middleware', () => {

  describe('findTerritory', () => {

    let seedTerritory = null;
    let seedCongregation = null;

    before(async () => {

      await helpers.clearCollection(CongregationModel);

      seedCongregation = await CongregationModel.create(congregationSeed.validCongregation);

      let seedTerritoryData = _.clone(territorySeed.territory.valid);
      seedTerritoryData.congregation = seedCongregation._id;

      seedTerritory = await TerritoryModel.create(seedTerritoryData);

    });

    it('should find territory', async () => {

      let res = mockResponse({locals: {}});
      let req = mockRequest({session: {congregation: seedCongregation._id}});
      let next = sinon.stub();

      await territoryMiddleware.findTerritory(req, res, next);

      expect(res.locals).to.have.property('territory');
      expect(res.locals.territory).to.have.property('current');

    });

    it('should not find territory and throw TerritoryNotFound', async () => {

      let res = mockResponse({locals: {}});
      let req = mockRequest({session: {congregation: new ObjectId()}});
      let next = sinon.stub();

      try{
        await territoryMiddleware.findTerritory(req, res, next);
        throw 'territory.findTerritory shoud not have fonud territory';
      }catch(e){
        expect(e instanceof errors.TerritoryNotFound).to.be.true;
      }

    });

  });

});
