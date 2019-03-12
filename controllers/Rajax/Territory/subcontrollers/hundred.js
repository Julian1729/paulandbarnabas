/**
 * Rajax Hundred Controller
 */
const HttpStatus = require('http-status-codes');

const logger = require('../../../../utils/logger');
const errors = require('../../../../errors');

var middleware = {};
var endpoints = {};

/**
 * Middlware
 */
  middleware.findHundred = (req, res, next) => {

    let territory = req.app.locals.territory;
    let street = req.app.locals.territory.current.street;
    let hundred = null;

    let reqHundred = req.params.hundred;

    // attempt to find hundred
    try {
      hundred = street.findHundred(reqHundred);
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
 * Endpoints
 */
  endpoints.addUnits = (req, res) => {

    let territory = req.app.locals.territory;
    let hundred = territory.current.hundred;

    let reqAddUnits = req.body.units;

    // optional parameters (skipDuplicates, overwriteDuplicates)
    let options = {};
    if(req.query.overwriteduplicates){
      options.overwriteDuplicates = true;
    }
    if(req.query.skipduplicates){
      options.skipDuplicates = true;
    }

    try {
      var addedUnitCount = hundred.addUnits(reqAddUnits, options);
    } catch (e) {
      if(e instanceof errors.UnitsAlreadyExist){
        return res.json({summary: {units_added: 0}, error: e});
      }
      console.log(e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }

    territory.territory.save()
      .then(territory => {
        return res.json({summary: {units_added: addedUnitCount}});
      })
      .catch(e => {
        console.log(e.stack);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      });

  };

module.exports = {middleware, endpoints};
