/**
 * Territory middleware
 */
const appRoot = require('app-root-path');
const HttpStatus = require('http-status-codes');

const errors = require(`${appRoot}/errors`);
const {logger} = require(`${appRoot}/utils`);
const {TerritoryModel} = require(`${appRoot}/models`);

exports.findTerritory = async (req, res, next) => {

  let territory = await TerritoryModel.findByCongregation(req.session.congregation);

  if(!territory) throw new errors.TerritoryNotFound(`Territory for congregation with id ${req.session.congregation} not found`);

  res.locals.territory = territory;

  // init current object
  res.locals.territory.current = {};

  return next();

};

exports.findRequestedStreet = (req, res, next) => {

  let territory = req.app.locals.territory;
  let street = null;
  try{
    street = territory.territory.findStreet(req.params.street_name);
    territory.current.street = street;
    logger.debug(`Street ${req.params.street_name} found`);
  }catch(e){
    if(e instanceof errors.StreetNotFound){
      console.log(e.stack);
      logger.debug(`Street ${req.params.street_name} not found`);
      return res.status(HttpStatus.NOT_FOUND).send();
    }
    console.log(e.stack);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
  }
  return next();

};

exports.findRequestedHundred = (req, res, next) => {

  let territory = req.app.locals.territory;
  let street = req.app.locals.territory.current.street;
  let hundred = null;

  let reqHundred = req.params.hundred;

  // attempt to find hundred
  try {
    hundred = street.findHundred(reqHundred);
    logger.debug(`Found ${reqHundred} hundred of ${street.name}`);
    // attach to locals
    territory.current.hundred = hundred;
    return next();
  } catch (e) {
    if(e instanceof errors.HundredNotFound){
      logger.debug(`${reqHundred} not found in ${street.name}`);
      return res.send(HttpStatus.NOT_FOUND).send();
    }else{
      console.log(e.stack);
      // delegate to main error handler
      throw e;
    }
  }
};

/**
 * Find requested unit
 */
exports.findUnit = function(req, res, next){

  let territory = req.app.locals.territory;
  let hundred = territory.current.hundred;

  let reqUnit = req.params.unit_number;

  let unit = null;

  try {
    unit = hundred.findUnit(reqUnit);
    logger.debug(`Unit ${unit.number} found`);
  } catch (e) {
    if(e instanceof errors.UnitNotFound){
      return res.status(HttpStatus.NOT_FOUND).send();
    }else{
      console.log(e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  // attach to locals
  territory.current.unit = unit;

  return next();

};

/**
 * If subunit query param is passed in with name,
 * find subunit and attach to locals
 */
exports.findSubunit = function(req, res, next){

  let reqSubunit = req.query.subunit || null;

  if(!reqSubunit) return next();

  let territory = req.app.locals.territory;
  let unit = territory.current.unit;

  let subunit = null;

  try {
    subunit = unit.findSubunit(reqSubunit);
    logger.debug(`Subunit ${subunit.name} found`);
  } catch (e) {
    if(e instanceof errors.SubunitNotFound){
      return res.status(HttpStatus.NOT_FOUND).send();
    }else{
      console.log(e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  // attach to locals
  territory.current.subunit = subunit;

  return next();

};

exports.findBlock = (req, res, next) =>{

  let territory = req.app.locals.territory;
  let reqBlock = req.params.side;
  // make sure that req.param.block equals "odd" or "even"
  if(!reqBlock || !(reqBlock === 'odd' || reqBlock === 'even')){
    logger.debug(`${reqBlock} must equal "odd" or "even"`);
    return res.status(HttpStatus.NOT_ACCEPTABLE).send();
  }
  let block = territory.current.hundred[reqBlock];
  // attach to locals
  territory.current.block = block;
  logger.debug(`${block.hundred} hundred found`);
  return next();
};
