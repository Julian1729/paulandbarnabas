/**
 * Populate data file with seed data.
 */
const CongregationModel = require('../../models/Congregation');
const UserModel = require('../../models/User');
const TerritoryModel = require('../../models/Territory');
const logger = require('../../utils/logger');
const Utils = require('../../utils/utils');
const CongregationSeed = require('./Congregation');
const UserSeed = require('./User');
const TerritorySeed = require('./Territory');

var seededData = require('./data');

var retrieveData = async () => {

  return CongregationModel.find({})
    // populate congregations
    .then(congregations => {
      seededData.congregations = congregations;
      return UserModel.find({});
    })
    // populate users
    .then(users => {
      seededData.users = users;
      return TerritoryModel.find({});
    })
    // populate territories
    .then(territories => {
      seededData.territories = territories;
    })
    .catch(e => {throw e});

};

var insertData = async () => {

  return Utils.clearCollection(CongregationModel)
    // Clear Congregation Collection
    // Clear User collection
    .then(r => {
      logger.debug('Congregation collection cleared');
      return Utils.clearCollection(UserModel)
    })
    // Clear User collection
    .then(r => {
      logger.debug('User collection cleared')
      return Utils.clearCollection(TerritoryModel);
    })
    // Clear Territory collection
    .then(r => {
      logger.debug('Territory collection cleared');
      return CongregationModel.create(CongregationSeed);
    })
    // Save congregation
    .then(congregations => {
      logger.debug(`${congregations.length} congregations entered into db`);
      seededData.congregations = congregations;
      // Set congregation Id for users to first congregation entered
      UserSeed.forEach(user => {
        user.congregation = congregations[0]._id;
      });
      return UserModel.create(UserSeed);
    })
    // Save Users
    .then(users => {
      logger.debug(`${users.length} users entered into db`)
      seededData.users = users;
      // Add congregation to territory obj
      TerritorySeed.forEach(territory => {
        territory.congregation = seededData.congregations[0]._id;
      });
      return TerritoryModel.create(TerritorySeed);
    })
    // Save Territory
    .then(territories => {
      logger.debug(`${territories.length} territories entered into db`);
      seededData.territories = territories;
      return true;
    })
    .catch(e => {
      logger.debug(e.stack);
      throw e;
    });

};

var dispatch = async (seed) => {
  if(seed){
    logger.debug('inserting data into db...')
    await insertData();
  }else{
    logger.debug('caching seed data from db...');
    await retrieveData();
  }
  populate();
};

var populate = () => {

  // Create Session data from first user
  var user = seededData.users[0];

  var admin = {
    first_name: user.first_name,
    last_name: user.last_name,
    isAdmin: true,
    congregation: user.congregation,
    user_id: user._id,
    authenticated: true
  };

  var regular = {
    first_name: user.first_name,
    last_name: user.last_name,
    isAdmin: false,
    congregation: user.congregation,
    user_id: user._id,
    authenticated: true
  };

  seededData.sessions = {admin, regular};

  logger.debug('seed data populated into data file');
};

module.exports = dispatch;
