/**
 * Test development seeding process
 */

const {expect} = require('chai');
const appRoot = require('app-root-path');

const models = require(`${appRoot}/models`);
const seedDatabase = require(`${appRoot}/dev/seed-database`);

describe('Seed', () => {

  let congregations = null;
  let users = null;
  let territories = null;

  before(async () => {

    await seedDatabase.init(true);
    congregations = await models.CongregationModel.find({});
    users = await models.UserModel.find({});
    territories = await models.TerritoryModel.find({});

  });

  it('should have 1 congregation', () => {

    expect(congregations).to.have.lengthOf(1);

  });

  it('should have 3 users', () => {

    expect(users).to.have.lengthOf(3);

  });

  it('should have 1 territory', () => {

    expect(territories).to.have.lengthOf(1);

  });

  it('should have set primary assets', () => {

    expect(seedDatabase.cache).to.have.property('primaryCongregation');
    expect(seedDatabase.cache).to.have.property('primaryTerritory');
    expect(seedDatabase.cache).to.have.property('primaryUser');

  });

  it('territory should have 2 fragments', () => {

    expect(seedDatabase.cache.primaryTerritory.fragments).to.have.lengthOf(2);

  });

  it('primary territory should be attached to primary congregation', () => {

    expect(seedDatabase.cache.primaryTerritory.congregation.equals(seedDatabase.cache.primaryCongregation._id)).to.be.true;

  });

  it('users should be attached to primary congregation', () => {

    for (let user of users) {
      expect(user.congregation.equals(seedDatabase.cache.primaryCongregation._id)).to.be.true;
    }

  });

  it('primary user should be admin of primary congregation', () => {

    expect(seedDatabase.cache.primaryCongregation.admin.equals(seedDatabase.cache.primaryUser._id)).to.be.true;

  });

});
