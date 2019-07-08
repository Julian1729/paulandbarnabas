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
const territorySeed = require(`${appRoot}/tests/seed/territory.seed`);
const controllers = require(`${appRoot}/ajax/controllers/territory`);
const {TerritoryModel} = require(`${appRoot}/models`);

describe('AJAX Territory Controller', () => {

  let seedTerritory = null;
  beforeEach(async () => {

    // clear and reseed territory
    await helpers.clearCollection(TerritoryModel);
    seedTerritory = await TerritoryModel.create(territorySeed.territory.completed);

  });

  describe('saveBlock', () => {

    it('should create new block', async () => {

      let res = mockResponse({locals: {}});
      let req = mockRequest({body: {
        'block_hundred': 1200,
        'odd_even': 'even',
        'units': [{number: 1200}, {number: 1202}],
        'street': 'Tampa',
        'new_street_name': null,
        'fragment_assignment': null,
        'fragment_unassigned': 'on'
      }});
      // set territory
      res.locals.territory = seedTerritory;
      sinon.spy(AjaxResponse.prototype, 'error');
      sinon.spy(AjaxResponse.prototype, 'send');
      sinon.spy(AjaxResponse.prototype, 'data');

      await controllers.territoryController.saveBlock(req, res);

      expect(AjaxResponse.prototype.error).to.not.have.been.called;
      expect(AjaxResponse.prototype.send).to.have.been.calledOnce;
      expect(AjaxResponse.prototype.data).to.have.been.calledWith('units_created', 2);
      let newStreet = _.find(seedTerritory.streets, ['name', 'Tampa']);
      expect(newStreet).to.not.be.undefined;
      expect(_.find(newStreet.hundreds, ['hundred', 1200]).even.units).to.have.lengthOf(2);

      AjaxResponse.prototype.error.restore();
      AjaxResponse.prototype.send.restore();
      AjaxResponse.prototype.data.restore();

    });

    it('should create block and assign to fragment', async () => {

      // create fragement
      seedTerritory.addFragment(2);

      let res = mockResponse({locals: {}});
      let req = mockRequest({body: {
        'block_hundred': 1200,
        'odd_even': 'even',
        'units': [{number: 1200}, {number: 1202}],
        'street': 'Tampa',
        'new_street_name': null,
        'fragment_assignment': 2,
        'fragment_unassigned': 'off'
      }});
      // set territory
      res.locals.territory = seedTerritory;
      sinon.spy(AjaxResponse.prototype, 'error');
      sinon.spy(AjaxResponse.prototype, 'send');
      sinon.spy(AjaxResponse.prototype, 'data');

      await controllers.territoryController.saveBlock(req, res);

      expect(AjaxResponse.prototype.data).to.have.been.calledWith('fragment_assignment', 2);

      AjaxResponse.prototype.error.restore();
      AjaxResponse.prototype.send.restore();
      AjaxResponse.prototype.data.restore();

    });

  });

  describe('saveFragment', () => {

    it('should save fragment 2', async () => {

      let res = mockResponse({locals: {territory: seedTerritory}});
      let req = mockRequest({body: {
        'fragment': {
          number: 2,
          blocks: [new ObjectId(), new ObjectId(), new ObjectId()],
          assignment: null
        }
      }});
      sinon.spy(AjaxResponse.prototype, 'error');
      sinon.spy(AjaxResponse.prototype, 'send');
      sinon.spy(AjaxResponse.prototype, 'data');

      await controllers.territoryController.saveFragment(req, res);

      expect(AjaxResponse.prototype.error).to.not.have.been.called;
      expect(AjaxResponse.prototype.data).to.have.been.calledOnceWithExactly('fragment', {number: 2, blocks: 3});
      expect(AjaxResponse.prototype.send).to.have.been.calledOnce;

      AjaxResponse.prototype.error.restore();
      AjaxResponse.prototype.send.restore();
      AjaxResponse.prototype.data.restore();

    });

    it('should save and assign fragment', async () => {

      let userId = new ObjectId();

      let res = mockResponse({locals: {territory: seedTerritory}});
      let req = mockRequest({body: {
        'fragment': {
          number: 2,
          blocks: [new ObjectId(), new ObjectId(), new ObjectId()],
          assignment: userId
        }
      }});
      sinon.spy(AjaxResponse.prototype, 'error');
      sinon.spy(AjaxResponse.prototype, 'send');

      await controllers.territoryController.saveFragment(req, res);

      expect(AjaxResponse.prototype.error).to.not.have.been.called;
      expect( res.json.getCall(0).args[0].data.fragment ).to.have.property('assignedTo');
      expect( res.json.getCall(0).args[0].data.fragment.assignedTo.toString() ).to.equal(userId.toString());
      expect(AjaxResponse.prototype.send).to.have.been.calledOnce;

      AjaxResponse.prototype.error.restore();
      AjaxResponse.prototype.send.restore();

    });

    it('should respond with FORM_VALIDATION_ERROR', async () => {

      let res = mockResponse({locals: {territory: seedTerritory}});
      let req = mockRequest({body: {
        'fragment': {
          number: null,
          blocks: [new ObjectId(), new ObjectId(), new ObjectId()],
          assignment: null
        }
      }});

      sinon.spy(AjaxResponse.prototype, 'error');

      await controllers.territoryController.saveFragment(req, res);

      expect(AjaxResponse.prototype.error).to.have.been.called;

      AjaxResponse.prototype.error.restore();

    });

  });

});
