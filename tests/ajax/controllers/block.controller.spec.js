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
const {blockController} = require(`${appRoot}/ajax/controllers/territory`);
const {TerritoryModel, UserModel} = require(`${appRoot}/models`);

// addTag not tested
// removeTag not tested

describe('markWorked', () => {

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

  it('should mark block worked', async () => {

    let seedStreet = seedTerritory.addStreet('Oakland');
    let seedHundred = seedStreet.addHundred(4500);
    seedHundred.addUnits([{number: 4504}, {number: 4502}]);
    let seedUnit = seedHundred.findUnit(4502);
    let seedBlock = seedHundred.even;
    let seedTimestamp = 894499200;

    let res = mockResponse({locals: {territory: seedTerritory, collected: {street: seedStreet, hundred: seedHundred, block: seedBlock}}});
    let req = mockRequest({query: {time: seedTimestamp}});

    await blockController.markWorked(req, res);

    expect(seedBlock.worked).to.have.lengthOf(1);
    expect(seedBlock.worked[0]).to.eql(new Date(seedTimestamp));

  });

});
