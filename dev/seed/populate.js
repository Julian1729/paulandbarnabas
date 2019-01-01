/**
 * Populate data file with seed data.
 */
const CongregationModel = require('../../models/Congregation');
const UserModel = require('../../models/User');
const TerritoryModel = require('../../models/Territory');
const logger = require('../../utils/logger');
const Utils = require('../../utils/utils');
const seededData = require('./data');

// populate congregations
CongregationModel.find({})
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
    logger.info('Seed data collected');
  })
  .catch(e => {throw e});
