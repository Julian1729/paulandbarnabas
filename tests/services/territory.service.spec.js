const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const {ObjectId} = require('mongodb');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const appRoot = require('app-root-path');

const {helpers} = require(`${appRoot}/utils`);
const {StreetNotFound, FragmentNotFound} = require(`${appRoot}/errors`);
const {territoryServices} = require(`${appRoot}/services`);
const userSeed = require(`${appRoot}/tests/seed/user.seed`);
const {TerritoryModel, UserModel} = require(`${appRoot}/models`);

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

  describe('streetStats', () => {

    it('should return street stats', () => {

      // add street
      let seedStreet = seedTerritory.addStreet('Overington', {skipExistenceCheck: true});
      let seedHundred1 = seedStreet.addHundred(1200);
      // enter 4 units
      let seedUnits1 = seedHundred1.addUnits([{number: 1202}, {number: 1204}, {number: 1205}, {number: 1206, subunits: ['Apt 1', 'Apt 2']}]);
      let seedHundred2 = seedStreet.addHundred(1300);
      // enter 2 units
      let seedUnits2 = seedHundred2.addUnits([{number: 1302}, {number: 1204}]);
      let stats = territoryServices.streetStats(seedTerritory, 'Overington');
      expect(stats).to.eql(
        {
          totals: {
            hundreds: 2,
            units: 6
          },
          hundreds: {
            '1200': {
              even_count: 3,
              odd_count: 1,
              even_id: seedHundred1.even._id,
              odd_id: seedHundred1.odd._id,
            },
            '1300': {
              even_count: 2,
              odd_count: 0,
              even_id: seedHundred2.even._id,
              odd_id: seedHundred2.odd._id,
            }
          }
        }
      );

    });

    it('should throw StreetNotFound', () => {

      try {
        territoryServices.streetStats(seedTerritory, 'Oakland');
        throw 'should have thrown StreetNotFound';
      } catch (e) {
        expect(e instanceof StreetNotFound).to.be.true;
      }

    });

  });

  describe('fragmentStats', () => {

    let seedFragment = null;
    let seedUser = null;
    let seedStreet = null;

    beforeEach(async () => {

      await helpers.clearCollection(UserModel);
      seedUser = await UserModel.create(userSeed.validUser);
      seedStreet = seedTerritory.addStreet('Oakland');
      let seedHundred1 = seedStreet.addHundred(1000);
      // 1 odd, 1 even
      seedHundred1.addUnits([{number: 1000}, {number: 1001}]);
      let seedHundred2 = seedStreet.addHundred(1200);
      // 1 odd, 1 even
      seedHundred2.addUnits([{number: 1202}, {number: 1203}]);
      seedFragment = seedTerritory.addFragment(35);
      // enter 4 blocks with 1 unit each
      seedFragment.assignBlocks([seedHundred1.odd._id, seedHundred1.even._id, seedHundred2.odd._id, seedHundred2.even._id], seedTerritory);
      seedFragment.assignHolder(seedUser._id);

    });

    it('should get fragment stats', async () => {

      let stats = await territoryServices.fragmentStats(seedTerritory, 35);
      expect(_.pick(stats, ['number', 'block_count', 'unit_count', 'last_worked', 'holder'])).to.eql({
        number: 35,
        block_count: 4,
        unit_count: 4,
        last_worked: null,
        holder: {
          name: `${seedUser.first_name} ${seedUser.last_name}`,
          title: seedUser.title,
          id: seedUser._id.toString()
        }
      });
      expect(stats).to.have.property('assigned_on');

    });

    it('should throw FragmentNotFound', async () => {

      try{
        await territoryServices.fragmentStats(seedTerritory, 48);
        throw 'should have thrown FragmentNotFound';
      }catch(e){
        expect(e instanceof FragmentNotFound).to.be.true;
      }

    });

  });

  describe('addTag', () => {

    it('should add tags to block and unit', async () => {

      let seedStreet = seedTerritory.addStreet('Oakland');
      let seedHundred = seedStreet.addHundred(4500);
      seedHundred.addUnits([{number: 4504}, {number: 4502}]);
      let seedUnit = seedHundred.findUnit(4502);

      // add tag to block
      await territoryServices.addTag(seedTerritory, seedHundred.odd ,'low steps');
      expect(seedHundred.odd.tags).to.include('low steps');

      // add tag to unit
      await territoryServices.addTag(seedTerritory, seedUnit,'low steps');
      await territoryServices.addTag(seedTerritory, seedUnit,'No trespassing');
      expect(seedUnit.tags).to.have.lengthOf(2);
      expect(seedUnit.tags).to.include('low steps');
      expect(seedUnit.tags).to.include('no trespassing');

      // should not duplicate tag
      await territoryServices.addTag(seedTerritory, seedUnit, 'Low steps');
      expect(seedUnit.tags).to.have.lengthOf(2);

    });

  });

  describe('removeTag', () => {

    it('should remove tags on block and unit', async () => {

      let seedStreet = seedTerritory.addStreet('Oakland');
      let seedHundred = seedStreet.addHundred(4500);
      seedHundred.addUnits([{number: 4504}, {number: 4502}]);
      let seedUnit = seedHundred.findUnit(4502);

      // add tag to block
      await territoryServices.addTag(seedTerritory, seedHundred.odd ,'low steps');
      await territoryServices.removeTag(seedTerritory, seedHundred.odd ,'low steps');
      expect(seedHundred.odd.tags).to.not.include('low steps');

      // add tag to unit
      await territoryServices.addTag(seedTerritory, seedUnit,'low steps');
      await territoryServices.addTag(seedTerritory, seedUnit,'No trespassing');
      await territoryServices.removeTag(seedTerritory, seedUnit, 'no trespassing');
      expect(seedUnit.tags).to.have.lengthOf(1);
      expect(seedUnit.tags).to.not.include('no trespassing');

    });

  });

  describe('markBlockWorked', () => {

    it('should add worked record to block', async () => {

      let seedStreet = seedTerritory.addStreet('Oakland');
      let seedHundred = seedStreet.addHundred(4500);
      seedHundred.addUnits([{number: 4504}, {number: 4502}]);

      await territoryServices.markBlockWorked(seedTerritory, seedHundred.odd);

      expect(seedHundred.odd.worked).to.have.lengthOf(1);

    });

    it('should add worked record to block with specified time', async () => {

      let seedStreet = seedTerritory.addStreet('Oakland');
      let seedHundred = seedStreet.addHundred(4500);
      seedHundred.addUnits([{number: 4504}, {number: 4502}]);

      let time = new Date().getTime();

      await territoryServices.markBlockWorked(seedTerritory, seedHundred.odd, time);

      expect(seedHundred.odd.worked).to.have.lengthOf(1);
      expect(seedHundred.odd.worked[0]).to.eql(new Date(time));

    });

  });

  describe('visitUnit', () => {

    it('should visit unit', async () => {

      let seedStreet = seedTerritory.addStreet('Oakland');
      let seedHundred = seedStreet.addHundred(4500);
      seedHundred.addUnits([{number: 4504}, {number: 4502}]);
      let seedUnit = seedHundred.findUnit(4502);

      let visit = await territoryServices.visitUnit(seedTerritory, seedUnit, {
        householders_contacted: ['Michael', 'Dwight'],
        details: 'Dwight is assistant TO the regional manager.'
      });

      expect(visit.contacted_by).to.eql('Unknown Publisher');
      expect(seedUnit.visits).to.have.lengthOf(1);
      expect(seedUnit.visits[0].contacted_by).to.eql('Unknown Publisher');
      expect(seedUnit.visits[0].householders_contacted).to.have.lengthOf(2);

    });

  });

  describe('addUnitHouseholder', () => {

    it('should add householder to unit', async () => {

      // add street
      let seedStreet = seedTerritory.addStreet('Overington', {skipExistenceCheck: true});
      let seedHundred = seedStreet.addHundred(1200);
      seedHundred.addUnits([{number: 1202}, {number: 1204}, {number: 1205}, {number: 1206, subunits: ['Apt 1', 'Apt 2']}]);
      let seedUnit = seedHundred.findUnit(1202);

      let householder = await territoryServices.addUnitHouseholder(seedTerritory, seedUnit, {
        name: 'Michael Scott',
        gender: 'male',
        email: 'mschott@dundermifflin.com',
        phone_number: '2154000468'
      });

      expect(householder).to.have.property('_id');
      expect(seedUnit.householders).to.have.lengthOf(1);

    });

  });

  describe('addUnitNote', () => {

    it('should add note to unit', async () => {

      let seedStreet = seedTerritory.addStreet('Oakland');
      let seedHundred = seedStreet.addHundred(4500);
      seedHundred.addUnits([{number: 4504}, {number: 4502}]);
      let seedUnit = seedHundred.findUnit(4502);

      let note = await territoryServices.addNote(seedTerritory, seedUnit, {
        by: 'Julian',
        note: 'This is a new note',
      });

      expect(note).to.have.property('_id');
      expect(seedUnit.notes).to.have.lengthOf(1);

    });

  });

  describe('setUnitMeta', () => {

    let seedStreet = null;
    let seedHundred = null;
    let seedUnit = null;
    beforeEach(() => {
      seedStreet = seedTerritory.addStreet('Oakland');
      seedHundred = seedStreet.addHundred(4500);
      seedHundred.addUnits([{number: 4504}, {number: 4502}]);
      seedUnit = seedHundred.findUnit(4502);
    })

    it('set unit as do not call', async () => {

      await territoryServices.setUnitMeta(seedTerritory, seedUnit, 'dnc', true);
      expect(seedUnit.isdonotcall).to.be.true;

    });

    it('set unit unit language', async () => {

      await territoryServices.setUnitMeta(seedTerritory, seedUnit, 'lang', 'en');
      expect(seedUnit.language).to.eql('en');

    });

    it('set unit as currently being called on', async () => {

      await territoryServices.setUnitMeta(seedTerritory, seedUnit, 'calledon', 'true');
      expect(seedUnit.iscalledon).to.be.true;

    });

    it('set unit as currently not being called on', async () => {

      await territoryServices.setUnitMeta(seedTerritory, seedUnit, 'calledon', 'true');
      await territoryServices.setUnitMeta(seedTerritory, seedUnit, 'calledon', 'false');
      expect(seedUnit.iscalledon).to.be.false;

      await territoryServices.setUnitMeta(seedTerritory, seedUnit, 'calledon', true);
      await territoryServices.setUnitMeta(seedTerritory, seedUnit, 'calledon', '0');
      expect(seedUnit.iscalledon).to.be.false;

    });

    it('set unit as name', async () => {

      await territoryServices.setUnitMeta(seedTerritory, seedUnit, 'name', 'Check Cashing');
      expect(seedUnit.name).to.eql('Check Cashing');

    });

  });

  // userFragments not tested
  // describe('userFragments', () => {});

  // fragmentBlocks not tested
  // describe('fragmentBlocks', () => {});

});
