/**
 * Territory service
 */
const _ = require('lodash');
const appRoot = require('app-root-path');

const errors = require(`${appRoot}/errors`);
const {logger} = require(`${appRoot}/utils`);
const UserModel = require(`${appRoot}/models/User.model`);

/**
 * Add units to block, create street and block if
 * they do not already exist.
 * @param  {Object}  territoryDoc  Territory document from db
 * @param  {String}  streetName    Street name to save units to
 * @param  {Number}  hundredNumber Hundred of street
 * @param  {Number}  fragmentAssignment Number of fragment to assign new block
 * @param  {Object}  newUnits      Unit objects with optional subunit names
 * @return {Number}                The amount of created units
 // OPTIMIZE: remove oddOrEven parameter and discern from units. This
 // would involve refactoring the model
 */
exports.saveBlock = async (territoryDoc, streetName, hundredNumber, oddOrEven, newUnits, fragmentAssignment) => {

  // search for street in db, or create it if it doesnt exist
  let street = null;
  try{
    street = territoryDoc.findStreet(streetName);
    logger.verbose(`${street_name} found`);
  }catch(e){
    if(e instanceof errors.StreetNotFound){
      // create street if it doesn't exist
      street = territoryDoc.addStreet(streetName, {skipExistenceCheck: true});
      logger.verbose(`${streetName} created`);
    }
  }

  // find hundred
  let hundred = null;
  // create hundred if it doesn't exist
  try {
    hundred = street.findHundred(hundredNumber);
    logger.verbose(`${hundredNumber} hundred of ${streetName} found`);
  } catch (e) {
    if(e instanceof errors.HundredNotFound){
      hundred = street.addHundred(hundredNumber);
      logger.verbose(`${hundredNumber} hundred of ${streetName} created`);
    }
  }

  let newUnitCount = hundred.addUnits(newUnits, {skipDuplicates: true});
  logger.verbose(`${newUnitCount} units entered into ${hundred.hundred} block of ${street.name}`);

  if(fragmentAssignment){
    let fragment = territoryDoc.findFragment(fragmentAssignment);
    fragment.assignBlocks([hundred[oddOrEven]._id], territoryDoc, {overwriteAssignments: true});
  }

  await territoryDoc.save();

  return newUnitCount;

};

/**
 * Save or update a fragment with new blocks and
 *  optionally a new user assignment.
 * @param  {Object}  territoryDoc   Territory document from db
 * @param  {Number}  fragmentNumber Fragment unique number
 * @param  {Array}  blockIds       Ids of blocks to add to fragment
 * @param  {mixed}  userAssignment ObjectId or string User Id to assign block to
 * @return {Object}                 New or updated fragment
 */
exports.saveFragment = async (territoryDoc, fragmentNumber, blockIds, userAssignment, options) => {

  // search for fragment
  let fragment = null;

  try {
    fragment = territoryDoc.findFragment(fragmentNumber);
    logger.verbose(`Fragment #${fragmentNumber} found`);
  } catch (e) {
    if(e instanceof errors.FragmentNotFound){
      fragment = territoryDoc.addFragment(fragmentNumber);
      logger.verbose(`Fragment #${fragmentNumber} created`);
    }else{
      throw e;
    }
  }

  fragment.assignBlocks(blockIds, territoryDoc, options);

  if(userAssignment){
    fragment.assignHolder(userAssignment);
    logger.verbose(`Fragment #${fragmentNumber} assigned to user with id "${userAssignment}"`);
  }

  await territoryDoc.save();

  return fragment;

};

/**
 * Breakdown of statistics of street
 * @param  {Object} territoryDoc Territory document from db
 * @param  {String} streetName   Exact Street name
 * @return {Object}              Object with stats
 */
exports.streetStats = (territoryDoc, streetName) => {

  let street = territoryDoc.findStreet(streetName);
  let stats = {
    totals: {
      hundreds: null,
      units: null,
    },
    hundreds: {},
  };
  // set stats on object
  // set total hundred count
  stats.totals.hundreds = street.hundreds.length;
  // begin hundred stat collection
  for (let hundred of street.hundreds) {
    stats.hundreds[hundred.hundred] = {
      even_count: hundred.even.units.length,
      even_id: hundred.even._id,
      odd_count: hundred.odd.units.length,
      odd_id: hundred.odd._id,
    };
    // add hundred unit count to totals
    stats.totals.units += (hundred.even.units.length + hundred.odd.units.length);
  }

  return stats;

};

/**
 * Breakdown of fragment statistics
 * @param  {Object}  territoryDoc  Territory document from db
 * @param  {mixed}  fragmentNumber Number or string fragment number
 * @return {Object}                Fragment statistics
 */
exports.fragmentStats = async (territoryDoc, fragmentNumber) => {

  let fragment = territoryDoc.findFragment(fragmentNumber);

  let stats = {
    number: fragment.number,
    block_count: fragment.blocks.length,
    unit_count: 0,
    last_worked: _.last(fragment.worked) || null,
    assigned_on: _.last(fragment.assignment_history).on || null,
    holder: null,
  };

  let currentHolder = fragment.holder();

  if(currentHolder){
    // get holder name and title
    let user = await UserModel.findById(currentHolder);
    if(user){
      stats.holder = {
        name: `${user.first_name} ${user.last_name}`,
        title: user.title,
        id: user._id.toString()
      };
    }
  }

  // get unit count
  let blocks = territoryDoc.findBlocksById(fragment.blocks);
  blocks.forEach(b => {
    stats.unit_count += b.block.units.length;
  });

  return stats;

}

exports.addTag = async (territoryDoc, taggable, tag) => {

  if(typeof taggable.addTag !== 'function'){
    throw new TypeError('territoryServices.addTag expects second parameter to be a block or unit mongoose document');
  }

  let newTag = taggable.addTag(tag);

  await territoryDoc.save();

  return newTag;

};

exports.removeTag = async (territoryDoc, taggable, tag) => {

  if(typeof taggable.addTag !== 'function'){
    throw new TypeError('territoryServices.removeTag expects second parameter to be a block or unit mongoose document');
  }

  let removedTag = taggable.removeTag(tag);

  await territoryDoc.save();

};

exports.markBlockWorked = async (territoryDoc, block, time) => {

  block.work(time);

  await territoryDoc.save();

};

exports.visitUnit = async (territoryDoc, visitable, visitInfo) => {

  if(typeof visitable.addTag !== 'function'){
    throw new TypeError('territoryServices.visitUnit expects second parameter to be a unit or subunit mongoose document');
  }

  let visit = visitable.addVisit(visitInfo);

  await territoryDoc.save();

  return visit;

};

exports.addUnitHouseholder = async (territoryDoc, unit, householderInfo) => {

  if(typeof unit.addTag !== 'function'){
    throw new TypeError('territoryServices.addUnitHouseholder expects second parameter to be a unit or subunit mongoose document');
  }

  let householder = unit.addHouseholder(householderInfo.name, householderInfo.gender, householderInfo.email, householderInfo.phone_number);

  await territoryDoc.save();

  return householder;

};

exports.addNote = async (territoryDoc, notable, noteObj) => {

  if(typeof notable.addTag !== 'function'){
    throw new TypeError('territoryServices.addNote expects second parameter to be a unit or subunit mongoose document');
  }

  let newNote = notable.addNote(noteObj);

  await territoryDoc.save();

  return newNote;

};

exports.setUnitMeta = async (territoryDoc, unit, metaField, metaValue) => {

  let convertToBoolean = val => {
    return (val === 'false' || val === '0') ? false : true;
  }

  switch (metaField) {
    case 'dnc':
      unit.isdonotcall = convertToBoolean(metaValue);
      break;
    case 'lang':
      // OPTIMIZE: check that language is a
      // valid language abbreviation
      unit.language = metaValue;
      break;
    case 'calledon':
      unit.iscalledon = convertToBoolean(metaValue);
      break;
    case 'name':
      unit.name = metaValue;
      break;
    default:
      return null;
  }

  await territoryDoc.save();

};

exports.userFragments = (territoryDoc, userId) => {

  return territoryDoc.findUserFragments(userId);

};

exports.fragmentBlocks = (territoryDoc, fragmentDoc) => {

  return territoryDoc.findBlocksById(fragmentDoc.blocks);

};
