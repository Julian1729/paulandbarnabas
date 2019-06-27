/**
 * Populate data file with seed data.
 */
const _ = require('lodash');
const yargs = require('yargs');
const appRoot = require('app-root-path');

const models = require(`${appRoot}/models`);
let seedData = require(`${appRoot}/dev/seed`);
const {logger, helpers} = require(`${appRoot}/utils`);

/**
 * Cache seeded data here
 * to be accessed quickly
 * for dev purposes
 * @type {Object}
 */
let cache = {};

// parse command line arguments with args
yargs
  .option('seed', {
    alias: 's',
    describe: 'Wipe and seed database with data defined in dev/seed'
  })
  .help();
// arguments
const argv = yargs.argv;

const retrieveData = async () => {

  // retrieve seeded congregations
  cache.congregations = await models.CongregationModel.find({});
  // retrieve seeded users
  cache.users = await models.UserModel.find({});
  // retrieve seeded territories
  cache.territories = await models.TerritoryModel.find({});

};

var insertData = async () => {

  // clear congregation collection
  await helpers.clearCollection(models.CongregationModel);
  logger.info('Congregation collection cleared');
  // clear users collection
  await helpers.clearCollection(models.UserModel);
  logger.info('User collection cleared')
  // clear users collection
  await helpers.clearCollection(models.TerritoryModel);
  logger.info('Territory collection cleared');

  // seed congregations
  cache.congregations = await models.CongregationModel.create(seedData.congregations);
  logger.info(`${cache.congregations.length} congregations seeded into database`);
  // set primary congregation as congregation with #99499
  cache.primaryCongregation = _.find(cache.congregations, ['number', 99499]);
  logger.info(`"${cache.primaryCongregation.name}" #${cache.primaryCongregation.number} set as primary congregation`);

  // seed users
  // set congregation for users as first congregation entered
  _.forEach(seedData.users, (user) => {
    user.congregation = cache.primaryCongregation._id;
  });
  cache.users = await models.UserModel.create(seedData.users);
  logger.info(`${cache.users.length} users seeed into database`);
  // set primary user as first user in user seed data
  cache.primaryUser = _.find(cache.users, ['email', seedData.users[0].email]);
  logger.info(`"${cache.primaryUser.first_name} ${cache.primaryUser.last_name}" set as primary user \nEmail: ${cache.primaryUser.email} Password: ${seedData.users[0].password}`);

  // set primary user as admin for primary congregation
  cache.primaryCongregation.admin = cache.primaryUser._id;
  cache.primaryCongregation = await cache.primaryCongregation.save();
  logger.info(`"${cache.primaryUser.first_name}" set as admin for congregation #${cache.primaryCongregation.number}`);

  // seed territories
  // set congregation as primary congregation for primary territory (first one at 0 index)
  seedData.territories[0].congregation = cache.primaryCongregation._id;
  cache.territories = await models.TerritoryModel.create(seedData.territories);
  logger.info(`${cache.territories.length} territories seeded into database`);
  // find and set primary territory
  cache.primaryTerritory = _.find(cache.territories, ['congregation', cache.primaryCongregation._id]);
  logger.info(`Territory with id ${cache.primaryTerritory._id.toString()} attached to congregation #${cache.primaryCongregation.number}`);

  // seed blocks and fragments
  // add 4500 and 4600 Oakland to fragment 1
  let oakland = cache.primaryTerritory.findStreet('Oakland');
  let oakland4500 = oakland.findHundred(4500);
  let oakland4600 = oakland.findHundred(4600);
  let fragment1 = cache.primaryTerritory.findFragment(1)
  fragment1.assignBlocks([
    oakland4500.odd._id,
    oakland4500.even._id,
    oakland4600.odd._id,
    oakland4600.even._id
  ], cache.primaryTerritory);
  logger.info(`4500 odd, 4500 even, 4600 odd, 4600 even of ${oakland.name} Street inserted into Fragment #${fragment1.number}`);
  // add 1500 Overington odd + even to fragment 2
  // get block ids
  let overington = cache.primaryTerritory.findStreet('Overington');
  let overington1500 = overington.findHundred(1500);
  let fragment2 = cache.primaryTerritory.findFragment(2);
  fragment2.assignBlocks([
    overington1500.odd._id,
    overington1500.even._id,
  ], cache.primaryTerritory);
  logger.info(`1500 odd, 1500 even of ${overington.name} Street inserted into Fragment #${fragment1.number}`);
  // assign fragment 1 and 2 to primary user
  cache.primaryTerritory.findFragment(1).assignHolder(cache.primaryUser._id);
  logger.info(`Fragment 1 assigned to "${cache.primaryUser.first_name} ${cache.primaryUser.last_name}"`);
  cache.primaryTerritory.findFragment(2).assignHolder(cache.primaryUser._id);
  logger.info(`Fragment 2 assigned to "${cache.primaryUser.first_name} ${cache.primaryUser.last_name}"`);

};

let init = async (seed) => {

  logger.info(`Using database "${models[_.keys(models)[0]].db.name}"`);

  if(seed){
    logger.info('Seeding database...');
    await insertData();
    logger.info('Database seeded');
  }else{
    logger.info('Caching seed data from db...');
    await retrieveData();
    logger.infor('Finished caching data.');
  }

};

if(argv.seed) return init(argv.seed);

module.exports = {init, cache};
