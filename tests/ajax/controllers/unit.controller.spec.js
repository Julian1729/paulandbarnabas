const sinon = require('sinon');
const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
const {ObjectId} = require('mongodb');
const HttpStatus = require('http-status-codes');
const {mockResponse, mockRequest} = require('mock-req-res');
const appRoot = require('app-root-path');

const {AjaxResponse, helpers} = require(`${appRoot}/utils`);
const {authenticationMiddleware} = require(`${appRoot}/middleware`);
const userSeed = require(`${appRoot}/tests/seed/user.seed`);
const territorySeed = require(`${appRoot}/tests/seed/territory.seed`);
const {unitController} = require(`${appRoot}/ajax/controllers/territory`);
const {TerritoryModel, UserModel} = require(`${appRoot}/models`);

describe('AJAX Territory > Unit Controllers', () => {

  let seedTerritory = null;
  let seedStreet = null;
  let seedHundred = null;
  let seedUnit = null;
  let seedSubunit = null;
  beforeEach(async () => {

    // clear and reseed territory
    await helpers.clearCollection(TerritoryModel);
    // seed with empty territory
    seedTerritory = await TerritoryModel.create({
      congregation: new ObjectId(),
      fragments: [],
      streets: []
    });

    seedStreet = seedTerritory.addStreet('Oakland');
    seedHundred = seedStreet.addHundred(4500);
    seedHundred.addUnits([{number: 4504}, {number: 4502, subunits: ['Apt 1']}]);
    seedUnit = seedHundred.findUnit(4504);
    seedSubunit = seedHundred.findUnit(4502).findSubunit('Apt 1');

  });

  describe('addVisit', () => {

    it('should record visit on unit', async () => {

      let res = mockResponse({locals: {territory: seedTerritory, collected: {street: seedStreet, hundred: seedHundred, unit: seedUnit}}});
      let req = mockRequest({body: {
        visit: {
          householders_contacted: ['Michael', 'Dwight'],
          contacted_by: 'Jan Levenson Gould',
          details: 'Dwight is preparing Michael for Jans baby'
        }
      }});
      await unitController.addVisit(req, res);

      expect(seedUnit.visits).to.have.lengthOf(1);
      expect(seedUnit.visits[0].contacted_by).to.eql('Jan Levenson Gould');

    });

    it('should record visit on subunit', async () => {

      let res = mockResponse({locals: {territory: seedTerritory, collected: {street: seedStreet, hundred: seedHundred, unit: seedUnit, subunit: seedSubunit}}});
      let req = mockRequest({body: {
        visit: {
          householders_contacted: ['Michael', 'Dwight'],
          contacted_by: 'Jan Levenson Gould',
          details: 'Dwight is preparing Michael for Jans baby'
        }
      }});

      expect(seedSubunit.visits).to.have.lengthOf(0);

      await unitController.addVisit(req, res);

      expect(seedSubunit.visits).to.have.lengthOf(1);

    });

  });

  describe('addTag', () => {

    it(`should add 'low steps' tag to unit`, async () => {

      let res = mockResponse({locals: {territory: seedTerritory, collected: {street: seedStreet, hundred: seedHundred, unit: seedUnit}}});
      let req = mockRequest({query: {tag: 'Low Steps'}});

      sinon.spy(AjaxResponse.prototype, 'data');
      sinon.spy(AjaxResponse.prototype, 'send');

      await unitController.addTag(req, res);

      expect(AjaxResponse.prototype.data).to.have.been.calledWith('tag', 'low steps');
      expect(AjaxResponse.prototype.send).to.have.been.calledOnce;
      expect(seedUnit.tags).to.include('low steps');

      AjaxResponse.prototype.data.restore();
      AjaxResponse.prototype.send.restore();

    });

    it(`should add low steps tag on subunit`, async () => {

      let res = mockResponse({locals: {territory: seedTerritory, collected: {street: seedStreet, hundred: seedHundred, unit: seedUnit, subunit: seedSubunit}}});
      let req = mockRequest({query: {tag: 'Low Steps'}});

      sinon.spy(AjaxResponse.prototype, 'data');
      sinon.spy(AjaxResponse.prototype, 'send');

      await unitController.addTag(req, res);

      expect(AjaxResponse.prototype.data).to.have.been.calledWith('tag', 'low steps');
      expect(AjaxResponse.prototype.send).to.have.been.calledOnce;
      expect(seedSubunit.tags).to.include('low steps');

      AjaxResponse.prototype.data.restore();
      AjaxResponse.prototype.send.restore();

    });

    it(`should send NOT_ACCEPTABLE response`, async () => {

      let res = mockResponse({locals: {territory: seedTerritory, collected: {street: seedStreet, hundred: seedHundred, unit: seedUnit}}});
      let req = mockRequest({query: {}});

      sinon.spy(AjaxResponse.prototype, 'send');

      await unitController.addTag(req, res);

      expect(AjaxResponse.prototype.send).to.not.have.been.called;
      expect(seedUnit.tags).have.lengthOf(0);

      AjaxResponse.prototype.send.restore();

    });

  });

  describe('addHouseholder', () => {

    it('should add householder to unit', async () => {

      let res = mockResponse({locals: {territory: seedTerritory, collected: {street: seedStreet, hundred: seedHundred, unit: seedUnit}}});
      let req = mockRequest({
        body: {
          householder: {
            name: 'Michael Scott',
            gender: 'male'
          },
        }
      });

      sinon.spy(AjaxResponse.prototype, 'data');
      sinon.spy(AjaxResponse.prototype, 'error');

      await unitController.addHouseholder(req, res);

      expect(AjaxResponse.prototype.error).to.not.have.been.called;
      expect(AjaxResponse.prototype.data).to.have.been.calledWith('householder');

      AjaxResponse.prototype.data.restore();
      AjaxResponse.prototype.error.restore();

    });

    it('should respond with VALIDATION_ERROR', async () => {

      let res = mockResponse({locals: {territory: seedTerritory, collected: {street: seedStreet, hundred: seedHundred, unit: seedUnit}}});
      let req = mockRequest({
        body: {}
      });

      sinon.spy(AjaxResponse.prototype, 'data');
      sinon.spy(AjaxResponse.prototype, 'error');

      await unitController.addHouseholder(req, res);

      expect(AjaxResponse.prototype.data).to.not.have.been.called;
      expect(AjaxResponse.prototype.error).to.have.been.calledWith('VALIDATION_ERROR');

      AjaxResponse.prototype.data.restore();
      AjaxResponse.prototype.error.restore();

    });

  });

  describe('addNote', () => {

    it('should add note to unit', async () => {

      let res = mockResponse({locals: {territory: seedTerritory, collected: {street: seedStreet, hundred: seedHundred, unit: seedUnit}}});
      let req = mockRequest({body: {
        note: {
          by: 'Julian Hernandez',
          note: 'This is a general note',
        }
      }});

      sinon.spy(AjaxResponse.prototype, 'data');
      sinon.spy(AjaxResponse.prototype, 'send');

      await unitController.addNote(req, res);

      expect(AjaxResponse.prototype.data).to.have.been.calledWith('note');
      expect(AjaxResponse.prototype.data.getCall(0).args[1]).to.have.property('_id');
      expect(AjaxResponse.prototype.send).to.have.been.calledOnce;
      expect(seedUnit.notes).to.have.lengthOf(1);

      AjaxResponse.prototype.data.restore();
      AjaxResponse.prototype.send.restore();

    });

  });

  describe('setMeta', () => {

    it('should set unit as a do not call', async () => {

      let res = mockResponse({locals: {territory: seedTerritory, collected: {street: seedStreet, hundred: seedHundred, unit: seedUnit}}});
      let req = mockRequest({query: {'dnc': 1}});

      sinon.spy(AjaxResponse.prototype, 'data');
      sinon.spy(AjaxResponse.prototype, 'send');

      await unitController.setMeta(req, res);

      expect(AjaxResponse.prototype.data.getCall(0).args).to.eql(['field', 'dnc']);
      expect(AjaxResponse.prototype.data.getCall(1).args).to.eql(['value', 1]);
      expect(AjaxResponse.prototype.send).to.have.been.calledOnce;
      expect(seedUnit.isdonotcall).to.be.true;

      AjaxResponse.prototype.data.restore();
      AjaxResponse.prototype.send.restore();

    });

    it('should set language as spanish', async () => {

      let res = mockResponse({locals: {territory: seedTerritory, collected: {street: seedStreet, hundred: seedHundred, unit: seedUnit}}});
      let req = mockRequest({query: {'lang': 'sp'}});

      sinon.spy(AjaxResponse.prototype, 'data');
      sinon.spy(AjaxResponse.prototype, 'send');

      await unitController.setMeta(req, res);

      expect(AjaxResponse.prototype.data.getCall(0).args).to.eql(['field', 'lang']);
      expect(AjaxResponse.prototype.data.getCall(1).args).to.eql(['value', 'sp']);
      expect(AjaxResponse.prototype.send).to.have.been.calledOnce;
      expect(seedUnit.language).to.eql('sp');

      AjaxResponse.prototype.data.restore();
      AjaxResponse.prototype.send.restore();

    });

    it('should set unit as being called on', async () => {

      let res = mockResponse({locals: {territory: seedTerritory, collected: {street: seedStreet, hundred: seedHundred, unit: seedUnit}}});
      let req = mockRequest({query: {'calledon': 'true'}});

      sinon.spy(AjaxResponse.prototype, 'data');
      sinon.spy(AjaxResponse.prototype, 'send');

      await unitController.setMeta(req, res);

      expect(AjaxResponse.prototype.data.getCall(0).args).to.eql(['field', 'calledon']);
      expect(AjaxResponse.prototype.data.getCall(1).args).to.eql(['value', 'true']);
      expect(AjaxResponse.prototype.send).to.have.been.calledOnce;
      expect(seedUnit.iscalledon).to.be.true;

      AjaxResponse.prototype.data.restore();
      AjaxResponse.prototype.send.restore();

    });

    it('should set unit name', async () => {

      let res = mockResponse({locals: {territory: seedTerritory, collected: {street: seedStreet, hundred: seedHundred, unit: seedUnit}}});
      let req = mockRequest({query: {'name': 'Check Cashing'}});

      sinon.spy(AjaxResponse.prototype, 'data');
      sinon.spy(AjaxResponse.prototype, 'send');

      await unitController.setMeta(req, res);

      expect(AjaxResponse.prototype.data.getCall(0).args).to.eql(['field', 'name']);
      expect(AjaxResponse.prototype.data.getCall(1).args).to.eql(['value', 'Check Cashing']);
      expect(AjaxResponse.prototype.send).to.have.been.calledOnce;
      expect(seedUnit.name).to.eql('Check Cashing');

      AjaxResponse.prototype.data.restore();
      AjaxResponse.prototype.send.restore();

    });

  });

});
