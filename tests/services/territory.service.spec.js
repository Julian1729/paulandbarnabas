const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const {ObjectId} = require('mongodb');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const appRoot = require('app-root-path');

const {helpers} = require(`${appRoot}/utils`);
const {TerritoryModel} = require(`${appRoot}/models`);
const {territoryServices} = require(`${appRoot}/services`);

describe('Territory Service', () => {

  let seedTerritory = null;

  beforeEach(async () => {

    await helpers.clearCollection(TerritoryModel);

    // seed with empty territory
    seedTerritory = await TerritoryModel.create({
      congregation: new ObjectId(),
      fragments: [],
      streets: []
    });

  });


  describe('saveBlock', () => {

    beforeEach(() => {

      sinon.spy(seedTerritory, 'addStreet');

    });

    afterEach(() => {

      seedTerritory.addStreet.restore();

    });

    it('should save 2 units', async () => {

      let newUnitCount = await territoryServices.saveBlock(seedTerritory, 'Oakland', 4500, 'even', [{number: 4502}, {number: 4506, subunits: ['Apt 1', 'Apt 2']}]);
      expect(seedTerritory.addStreet).to.have.been.calledOnce;
      expect(newUnitCount).to.equal(2);
      expect(seedTerritory.streets).to.have.lengthOf(1);

    });

    it('should assign 1 block to fragment', async () => {

      // create fragment to assign to
      seedTerritory.fragments.push({number: 2});
      expect(seedTerritory.fragments).to.have.lengthOf(1);
      await territoryServices.saveBlock(seedTerritory, 'Oakland', 4500, 'even', [{number: 4502}, {number: 4506, subunits: ['Apt 1', 'Apt 2']}], 2);
      expect(seedTerritory.findFragment(2).blocks).to.have.lengthOf(1);
      expect(seedTerritory.findFragment(2).blocks[0]).to.have.property('_id');
      expect(seedTerritory.findFragment(2).blocks[0]._id instanceof ObjectId).to.be.true;

    });

  });

  describe('saveFragment', () => {

    it('should create fragment #1 and assign 2 blocks', async () => {

      // create fragment to assign to
      await territoryServices.saveFragment(seedTerritory, 2, [new ObjectId(), new ObjectId()]);
      let newFragment = seedTerritory.findFragment(2);
      expect(newFragment).to.exist;
      expect(newFragment.blocks).to.have.lengthOf(2);

    });

    // should save/update fragment #1
    it('should create fragment #1 and assign fragment to user', async () => {

      // create fragment to assign to
      let userAssignmentId = new ObjectId();
      await territoryServices.saveFragment(seedTerritory, 2, [new ObjectId(), new ObjectId()], userAssignmentId);
      let newFragment = seedTerritory.findFragment(2);
      expect(newFragment).to.exist;
      expect(newFragment.holder().toString()).to.equal(userAssignmentId.toString());

    });

  });

});
