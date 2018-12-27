/**
 * Insert seed data into database, and export results
 */

const CongregationModel = require('../../models/Congregation');
const CongregationSeed = require('./Congregation');
const UserModel = require('../../models/User');
const UserSeed = require('./User');
const logger = require('../../utils/logger');
const Utils = require('../../utils/utils');

var insertedData = {};

// Clear Congregation Collection
Utils.clearCollection(CongregationModel)
  // Clear User collection
  .then(r => {
    logger.debug('Congregation collection cleared');
    return Utils.clearCollection(UserModel)
  })
  // User collection cleared
  .then(r => {
    logger.debug('User collection cleared')
    return CongregationModel.create(CongregationSeed);
  })
  // Save congregation
  .then(congregations => {
    logger.debug(`${congregations.length} congregations entered into db`);
    insertedData.congregations = congregations;
    // Set congregation Id for users to first congregation entered
    UserSeed.forEach(user => {
      user.congregation = congregations[0]._id;
    })
    return UserModel.create(UserSeed);
  })
  // Save Users
  .then(users => {
    logger.debug(`${users.length} users entered into db`)
    insertedData.users = users;
  })
  .catch(e => {
    logger.debug(e.stack);
    throw e;
  });

  module.exports = insertedData;
