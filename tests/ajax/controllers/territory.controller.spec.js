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
const controllers = require(`${appRoot}/ajax/controllers/territory`);
const {TerritoryModel, UserModel} = require(`${appRoot}/models`);

describe('AJAX Territory Controller', () => {

  let seedTerritory = null;
  beforeEach(async () => {

    // clear and reseed territory
    await helpers.clearCollection(TerritoryModel);
    // seed with empty territory
    seedTerritory = await TerritoryModel.create({
      congregation: new ObjectId(),
      fragments: [],
      streets: []
    });

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

  describe('getStreetStats', () => {

    it('should get correct street stats', () => {

      // add street
      let seedStreet = seedTerritory.addStreet('Overington', {skipExistenceCheck: true});
      let seedHundred1 = seedStreet.addHundred(1200);
      // enter 4 units
      let seedUnits1 = seedHundred1.addUnits([{number: 1202}, {number: 1204}, {number: 1205}, {number: 1206, subunits: ['Apt 1', 'Apt 2']}]);
      let seedHundred2 = seedStreet.addHundred(1300);
      // enter 2 units
      let seedUnits2 = seedHundred2.addUnits([{number: 1302}, {number: 1204}]);

      let res = mockResponse({locals: {territory: seedTerritory}});
      let req = mockRequest({params: {street_name: 'Overington'}});

      sinon.spy(AjaxResponse.prototype, 'error');
      sinon.spy(AjaxResponse.prototype, 'data');

      controllers.territoryController.getStreetStats(req, res);

      expect(AjaxResponse.prototype.error).to.not.have.been.called;
      expect(AjaxResponse.prototype.data).to.have.been.calledWith('stats', {
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
      });

      AjaxResponse.prototype.error.restore();
      AjaxResponse.prototype.data.restore();

    });

    it('should send STREET_NOT_FOUND error', () => {

      let res = mockResponse({locals: {territory: seedTerritory}});
      let req = mockRequest({params: {street_name: 'Overington'}});

      sinon.spy(AjaxResponse.prototype, 'error');
      sinon.spy(AjaxResponse.prototype, 'data');

      controllers.territoryController.getStreetStats(req, res);

      expect(AjaxResponse.prototype.error).to.have.been.calledWith('STREET_NOT_FOUND');
      expect(AjaxResponse.prototype.data).to.not.have.been.called;

      AjaxResponse.prototype.error.restore();
      AjaxResponse.prototype.data.restore();

    });

  });

  describe('getAllStreetStats', () => {

    it('should get all streets and their stats', () => {

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

        let res = mockResponse({locals: {territory: seedTerritory}});
        let req = mockRequest();

        sinon.spy(AjaxResponse.prototype, 'data');

        controllers.territoryController.getAllStreetStats(req, res);

        expect(AjaxResponse.prototype.data).to.have.been.calledWith('streets',
          [
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
          ]
        );

        AjaxResponse.prototype.data.restore();

    });

  });

  describe('getFragmentStats', () => {

    it('should get fragment stats', async () => {

      // create seed user and enter seed fragment into territory
      await helpers.clearCollection(UserModel);
      seedUser = await UserModel.create(userSeed.validUser);
      let seedFragment = seedTerritory.addFragment(35);
      // enter 3 ids as block ids
      seedFragment.assignBlocks([new ObjectId(), new ObjectId(), new ObjectId()], seedTerritory);
      seedFragment.assignHolder(seedUser._id);

      let res = mockResponse({locals: {territory: seedTerritory}});
      let req = mockRequest({params: {fragment_number: 35}});

      sinon.spy(AjaxResponse.prototype, 'error');
      sinon.spy(AjaxResponse.prototype, 'data');

      await controllers.territoryController.getFragmentStats(req, res);

      expect(AjaxResponse.prototype.error).to.not.have.been.calledWith('FRAGMENT_NOT_FOUND');
      expect(AjaxResponse.prototype.data).to.have.been.calledOnceWith('stats', {
        number: 35,
        blocks: 3,
        holder: {
          name: `${seedUser.first_name} ${seedUser.last_name}`,
          title: seedUser.title,
          id: seedUser._id.toString()
        }
      });

      AjaxResponse.prototype.error.restore();
      AjaxResponse.prototype.data.restore();

    });

    it('should respond with FRAGMENT_NOT_FOUND', async () => {

      let res = mockResponse({locals: {territory: seedTerritory}});
      let req = mockRequest({params: {fragment_number: 50}});

      sinon.spy(AjaxResponse.prototype, 'data');
      sinon.spy(AjaxResponse.prototype, 'error');

      await controllers.territoryController.getFragmentStats(req, res);

      expect(AjaxResponse.prototype.data).to.not.have.been.called;
      expect(AjaxResponse.prototype.error).to.have.been.calledWith('FRAGMENT_NOT_FOUND');

      AjaxResponse.prototype.error.restore();
      AjaxResponse.prototype.data.restore();

    });

  });

  describe('getAllFragmentStats', () => {

    it('should get fragment stats', async () => {

      // create seed user and enter seed fragment into territory
      await helpers.clearCollection(UserModel);
      seedUser = await UserModel.create(userSeed.validUser);
      let seedFragment = seedTerritory.addFragment(35);
      // enter 3 ids as block ids
      seedFragment.assignBlocks([new ObjectId(), new ObjectId(), new ObjectId()], seedTerritory);
      seedFragment.assignHolder(seedUser._id);
      // seed second fragment
      let seedFragment2 = seedTerritory.addFragment(36);
      // enter 3 ids as block ids
      seedFragment2.assignBlocks([new ObjectId()], seedTerritory);
      seedFragment2.assignHolder(seedUser._id);

      let res = mockResponse({locals: {territory: seedTerritory}});
      let req = mockRequest();

      sinon.spy(AjaxResponse.prototype, 'data');
      sinon.spy(AjaxResponse.prototype, 'error');

      await controllers.territoryController.getAllFragmentStats(req, res);

      expect(AjaxResponse.prototype.error).to.not.have.been.called;
      expect(AjaxResponse.prototype.data).to.have.been.calledWith('fragments',
        [
          {
            number: 35,
            blocks: 3,
            holder: {
              name: `${seedUser.first_name} ${seedUser.last_name}`,
              title: seedUser.title,
              id: seedUser._id.toString()
            }
          },
          {
            number: 36,
            blocks: 1,
            holder: {
              name: `${seedUser.first_name} ${seedUser.last_name}`,
              title: seedUser.title,
              id: seedUser._id.toString()
            }
          }
        ]
      );

      AjaxResponse.prototype.error.restore();
      AjaxResponse.prototype.data.restore();

    });

  });

});
