/**
 * Territory middleware
 */
const _ = require('lodash');
const appRoot = require('app-root-path');
const HttpStatus = require('http-status-codes');

const errors = require(`${appRoot}/errors`);
const {logger} = require(`${appRoot}/utils`);
const {TerritoryModel} = require(`${appRoot}/models`);
const {territoryServices} = require(`${appRoot}/services`);

/**
 * Find and load user territory
 * to be used on route
 */
exports.findTerritory = async (req, res, next) => {

  let territory = await TerritoryModel.findByCongregation(req.session.congregation);

  if(!territory) throw new errors.TerritoryNotFound(`Territory for congregation with id ${req.session.congregation} not found`);

  res.locals.territory = territory;

  // init collected object to hold collected territory assets
  res.locals.collected = {};

  return next();

};

/**
 * Find and load the street requested
 * in url and attach to collection
 */
exports.findRequestedStreet = (req, res, next) => {

  let territory = res.locals.territory;
  let requestedStreetName = req.params.street_name;

  let street = null;
  try{
    street = territory.findStreet(requestedStreetName);
    res.locals.collected.street = street;
    logger.verbose(`collected "${street.name}" street`);
  }catch(e){
    if(e instanceof errors.StreetNotFound){
      logger.verbose(`street "${req.params.street_name}" not found`);
      return res.status(HttpStatus.NOT_FOUND).send();
    }else{
      throw e;
    }
  }

  return next();

};

/**
 * Find and load requested street hundred
 * in url and attach to route collection
 */
exports.findRequestedHundred = (req, res, next) => {

  let territory = res.locals.territory;
  let street = res.locals.collected.street;
  let requestedHundred = req.params.hundred;

  let hundred = null;
  try {
    hundred = street.findHundred(requestedHundred);;
    logger.verbose(`collected ${requestedHundred} hundred of ${street.name}`);
  } catch (e) {
    if(e instanceof errors.HundredNotFound){
      logger.verbose(`${requestedHundred} hundred not found in ${street.name}`);
      return res.status(HttpStatus.NOT_FOUND).send();
    }else{
      throw e;
    }
  }

  res.locals.collected.hundred = hundred;

  return next();

};

/**
 * Find and load requested unit
 * un url and attach to route collection
 */
exports.findRequestedUnit = function(req, res, next){

  let territory = res.locals.territory;
  let hundred = res.locals.collected.hundred;

  let requestedUnitNumber = req.params.unit_number;

  let unit = null;
  try {
    unit = hundred.findUnit(requestedUnitNumber);
    logger.verbose(`collected unit ${unit.number}`);
  } catch (e) {
    if(e instanceof errors.UnitNotFound){
      logger.verbose(`unit ${requestedUnitNumber} not found in ${hundred.hundred} ${res.locals.collected.street.name}`);
      return res.status(HttpStatus.NOT_FOUND).send();
    }else{
      throw e;
    }
  }

  // attach to locals
  res.locals.collected.unit = unit;

  return next();

};

/**
 * If subunit query param is passed in with name,
 * find subunit and attach to locals
 */
exports.findRequestedSubunit = function(req, res, next){

  let requestedSubunitName = req.query.subunit || null;

  if(!requestedSubunitName) return next();

  let territory = res.locals.territory;
  let unit = res.locals.collected.unit;

  let subunit = null;
  try {
    subunit = unit.findSubunit(requestedSubunitName);
    logger.verbose(`collected subunit "${subunit.name}"`);
  } catch (e) {
    if(e instanceof errors.SubunitNotFound){
      logger.verbose(`subunit "${requestedSubunitName}" not found in ${unit.number} ${res.locals.collected.street.name}`);
      return res.status(HttpStatus.NOT_FOUND).send();
    }else{
      throw e;
    }
  }

  // attach to locals
  res.locals.collected.subunit = subunit;

  return next();

};

exports.findRequestedBlock = (req, res, next) =>{

  let territory = res.locals.territory;
  let hundred = res.locals.collected.hundred;
  let requestedBlockSide = req.params.side;

  // make sure that req.param.block equals "odd" or "even"
  if(!requestedBlockSide || !(requestedBlockSide === 'odd' || requestedBlockSide === 'even')){
    logger.verbose(`${requestedBlockSide} must equal "odd" or "even"`);
    return res.status(HttpStatus.NOT_ACCEPTABLE).send();
  }

  let block = hundred[requestedBlockSide];
  res.locals.collected.block = block;
  logger.verbose(`collected ${requestedBlockSide} side of ${res.locals.collected.hundred.hundred} ${res.locals.collected.street.name}`);

  return next();

};

exports.findRequestedFragment = (req, res, next) => {

  let territory = res.locals.territory;
  let fragmentNumber = req.params.fragment_number;

  let fragment = null;
  try {
    fragment = territory.findFragment(fragmentNumber);
  } catch (e) {
    if(e instanceof errors.FragmentNotFound){
      logger.verbose(`Fragment #${fragmentNumber} not found in territory with id ${territory._id}`);
      return res.status(HttpStatus.NOT_FOUND).send();
    }else{
      throw e;
    }
  }

  res.locals.collected.fragment = fragment;
  return next();

};

/**
 * Search territory for fragments assigned
 * to session's user and attach to route locals
 */
exports.findUserFragments = (req, res, next) => {

  // OPTIMIZE: refactor when session api is refactored
  let userId = req.session.user_id;

  let territory = res.locals.territory;
  let userFragments = territoryServices.userFragments(territory, userId);
  logger.verbose(`Found fragments ${_.map(userFragments, 'number').join(', ')} for logged in user`);

  res.locals.collected.user_fragments = userFragments;
  return next();

};

/**
 * Search for fragment blocks within territory. This must be
 * run after findUserFragments, and will not work only after
 * findRequestedFragment becuase this will return 301 UNAUTHORIZED if
 * the requested fragment is not assigned to the user.
 */
exports.findRequestedFragmentBlocks = (req, res, next) => {

  let territory = res.locals.territory;
  let userFragments = res.locals.collected.user_fragments;
  let requestedFragmentNumber = req.params.fragment_number;

  let fragment = _.find(userFragments, ['number', (requestedFragmentNumber * 1)]);
  if(!fragment){
    logger.verbose(`Fragment #${requestedFragmentNumber} was not found in this user's assigned fragments`);
    // OPTIMIZE: send a GUI communicable error
    return res.status(HttpStatus.UNAUTHORIZED).send();
  }

  let blockReferences = territoryServices.fragmentBlocks(territory, fragment);

  // reference requested fragment's assigned blocks as blocks
  res.locals.collected.fragmentBlockReferences = blockReferences;

  return next();

};

/**
 * Find requested unit when fragment
 * is loaded first, so that the unit is
 * assured to be in fragment, or return 404
 */
exports.findRequestedFragmentUnit = (req, res, next) => {

  let requestedUnitNumber = req.params.unit_number * 1;
  let requestedSubunitName = req.query.subunit;
  let requestedStreetName = req.params.street_name;

  let fragmentBlocks = res.locals.collected.fragmentBlockReferences;

  // search for blocks with street in fragment blocks
  let streetBlocks = _.filter(fragmentBlocks, ['street', requestedStreetName]);
  if(!streetBlocks){
    logger.verbose(`${requestedStreetName} street not found in Fragment #${fragmentNumber}`);
    return res.status(HttpStatus.NOT_FOUND).send();
  }

  let unit = null;
  let block = null;
  streetBlocks.forEach(blockRef => {
     let foundUnit = _.find(blockRef.block.units, ['number', requestedUnitNumber]) || null;
     if(foundUnit){
       block = blockRef;
       unit = foundUnit;
       return false;
     }
  });
  if(!unit) {
    logger.verbose(`${requestedUnitNumber} unit not found in ${requestedStreetName} street`);
    return res.status(HttpStatus.NOT_FOUND).send();
  }

  let subunit = {};
  if(requestedSubunitName){
    // search for subunit
    try {
      subunit = unit.findSubunit(requestedSubunitName);
    } catch (e) {
      if(e instanceof errors.SubunitNotFound){
        logger.verbose(`${requestedSubunitName} not found in ${unit.number} ${requestedStreetName}`);
        res.status(HttpStatus.NOT_FOUND).send();
      }else{
        throw e;
      }
    }
  }

  res.locals.collected.unit = unit;
  res.locals.collected.subunit = _.isEmpty(subunit) ? {} : subunit;
  res.locals.collected.blockRef = block;

  return next();

};
