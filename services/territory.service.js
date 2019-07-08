/**
 * Territory service
 */
const _ = require('lodash');
const appRoot = require('app-root-path');

const errors = require(`${appRoot}/errors`);
const {logger} = require(`${appRoot}/utils`);

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

exports.saveFragment = async (territoryDoc, fragmentNumber, blockIds, userAssignment) => {

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

  fragment.assignBlocks(blockIds, territoryDoc);

  if(userAssignment){
    fragment.assignHolder(userAssignment);
    logger.verbose(`Fragment #${fragmentNumber} assigned to user with id "${userAssignment}"`);
  }

  return fragment;

};
