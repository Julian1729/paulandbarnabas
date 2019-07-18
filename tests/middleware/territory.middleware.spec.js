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

  let seedTerritory = null;
  let seedCongregation = null;

  beforeEach(async () => {

    await helpers.clearCollection(CongregationModel);

    seedCongregation = await CongregationModel.create(congregationSeed.validCongregation);

    let seedTerritoryData = _.clone(territorySeed.territory.valid);
    seedTerritoryData.congregation = seedCongregation._id;

    seedTerritory = await TerritoryModel.create(seedTerritoryData);

  });

  describe('findTerritory', () => {

    it('should find territory', async () => {

      let res = mockResponse({locals: {}});
      let req = mockRequest({session: {congregation: seedCongregation._id}});
      let next = sinon.stub();

      await territoryMiddleware.findTerritory(req, res, next);

      expect(res.locals).to.have.property('territory');
      expect(res.locals).to.have.property('collected');

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

  describe('findRequestedStreet', () => {

    it('should find street', () => {

      // add street
      seedTerritory.addStreet('Oakland');

      let res = mockResponse({locals: {territory: seedTerritory, collected: {}}});
      let req = mockRequest({session: {congregation: seedCongregation._id}, params: {street_name: 'Oakland'}});
      let next = sinon.stub();

      territoryMiddleware.findRequestedStreet(req, res, next);

      expect(res.locals.collected.street).to.not.be.undefined
      expect(res.locals.collected.street).and.to.have.property('_id');
      expect(next).to.have.been.calledOnce;

    });

    it('should not find street and respond with 404', () => {

      let res = mockResponse({locals: {territory: seedTerritory, collected: {}}});
      let req = mockRequest({session: {congregation: seedCongregation._id}, params: {street_name: 'FakeStreet'}});
      let next = sinon.stub();

      territoryMiddleware.findRequestedStreet(req, res, next);

      expect(next).to.not.have.been.called;
      expect(res.status).to.have.been.calledWith(HttpStatus.NOT_FOUND);
      expect(res.send).to.have.been.called;

    });

  });

  describe('findRequestedHundred', () => {

    it('should find 4500 Oakland', () => {

      // add street
      let seedStreet = seedTerritory.addStreet('Oakland');
      seedStreet.addHundred(4500);

      let res = mockResponse({locals: {territory: seedTerritory, collected: {street: seedStreet}}});
      let req = mockRequest({session: {congregation: seedCongregation._id}, params: {hundred: "4500"}});
      let next = sinon.stub();

      territoryMiddleware.findRequestedHundred(req, res, next);

      expect(res.locals.collected).to.have.property('hundred');
      expect(res.locals.collected.hundred).to.have.property('_id');
      expect(next).to.have.been.calledOnce;

    });

    it('should find 4500 Oakland', () => {

      // add street
      let seedStreet = seedTerritory.addStreet('Oakland');

      let res = mockResponse({locals: {territory: seedTerritory, collected: {street: seedStreet}}});
      let req = mockRequest({session: {congregation: seedCongregation._id}, params: {hundred: "4500"}});
      let next = sinon.stub();

      territoryMiddleware.findRequestedHundred(req, res, next);

      expect(next).to.not.have.been.called;
      expect(res.locals.collected).to.not.have.property('hundred');
      expect(res.status).to.have.been.calledWith(HttpStatus.NOT_FOUND);

    });

  });

  describe('findRequestedUnit', () => {

    it('should find requested unit', () => {

      // add street
      let seedStreet = seedTerritory.addStreet('Oakland');
      let seedHundred = seedStreet.addHundred(4500);
      let units = seedHundred.addUnits([{number: 4502}]);

      let res = mockResponse({locals: {territory: seedTerritory, collected: {street: seedStreet, hundred: seedHundred}}});
      let req = mockRequest({session: {congregation: seedCongregation._id}, params: {unit_number: "4502"}});
      let next = sinon.stub();

      territoryMiddleware.findRequestedUnit(req, res, next);

      expect(res.locals.collected).to.have.property('unit');
      expect(res.locals.collected.unit).to.have.property('_id');
      expect(next).to.have.been.calledOnce;

    });

    it('should respond with 404 UnitNotFound', () => {

      // add street
      let seedStreet = seedTerritory.addStreet('Oakland');
      let seedHundred = seedStreet.addHundred(4500);

      let res = mockResponse({locals: {territory: seedTerritory, collected: {street: seedStreet, hundred: seedHundred}}});
      let req = mockRequest({session: {congregation: seedCongregation._id}, params: {unit_number: "4502"}});
      let next = sinon.stub();

      territoryMiddleware.findRequestedUnit(req, res, next);

      expect(next).to.not.have.been.called;
      expect(res.status).to.have.been.calledWith(HttpStatus.NOT_FOUND);
      expect(res.locals.collected).to.not.have.property('unit');

    });

  });

  describe('findRequestedSubunit', () => {

    it('should find requested subunit', () => {

      // add street
      let seedStreet = seedTerritory.addStreet('Oakland');
      let seedHundred = seedStreet.addHundred(4500);
      let units = seedHundred.addUnits([{number: 4502, subunits: ['Apt 1']}]);
      let seedUnit = seedHundred.findUnit(4502);

      let res = mockResponse({locals: {territory: seedTerritory, collected: {street: seedStreet, hundred: seedHundred, unit: seedUnit}}});
      let req = mockRequest({session: {congregation: seedCongregation._id}, params: {unit_number: "4502"}, query: {subunit: 'Apt 1'}});
      let next = sinon.stub();

      territoryMiddleware.findRequestedSubunit(req, res, next);

      expect(next).to.have.been.calledOnce;
      expect(res.locals.collected).to.have.property('subunit');
      expect(res.locals.collected.unit).to.have.property('_id');

    });

    it('should respond with 404 SubunitNotFound', () => {

      // add street
      let seedStreet = seedTerritory.addStreet('Oakland');
      let seedHundred = seedStreet.addHundred(4500);
      let units = seedHundred.addUnits([{number: 4502}]);
      let seedUnit = seedHundred.findUnit(4502);

      let res = mockResponse({locals: {territory: seedTerritory, collected: {street: seedStreet, hundred: seedHundred, unit: seedUnit}}});
      let req = mockRequest({session: {congregation: seedCongregation._id}, params: {unit_number: "4502"}, query: {subunit: 'Apt 1'}});
      let next = sinon.stub();

      territoryMiddleware.findRequestedSubunit(req, res, next);

      expect(next).to.not.have.been.called;
      expect(res.status).to.have.been.calledWith(HttpStatus.NOT_FOUND);
      expect(res.locals.collected).to.not.have.property('subunit');

    });

  });

  describe('findRequestedBlock', () => {

    it('should find requested block (hundred side)', () => {

      // add street
      let seedStreet = seedTerritory.addStreet('Oakland');
      let seedHundred = seedStreet.addHundred(4500);
      let units = seedHundred.addUnits([{number: 4502}]);

      let res = mockResponse({locals: {territory: seedTerritory, collected: {street: seedStreet, hundred: seedHundred}}});
      let req = mockRequest({session: {congregation: seedCongregation._id}, params: {side: "even"}});
      let next = sinon.stub();

      territoryMiddleware.findRequestedBlock(req, res, next);

      expect(res.locals.collected).to.have.property('block');
      expect(res.locals.collected.block.units).to.have.lengthOf(1);
      expect(next).to.have.been.calledOnce;

    });

    it('should respond with NOT_ACCEPTABLE', () => {

      // add street
      let seedStreet = seedTerritory.addStreet('Oakland');
      let seedHundred = seedStreet.addHundred(4500);
      let units = seedHundred.addUnits([{number: 4502}]);

      let res = mockResponse({locals: {territory: seedTerritory, collected: {street: seedStreet, hundred: seedHundred}}});
      let req = mockRequest({session: {congregation: seedCongregation._id}, params: {side: "what"}});
      let next = sinon.stub();

      territoryMiddleware.findRequestedBlock(req, res, next);

      expect(next).to.not.have.been.called;
      expect(res.locals.collected).to.not.have.property('block');
      expect(res.status).to.have.been.calledWith(HttpStatus.NOT_ACCEPTABLE);

    });

  });

});
