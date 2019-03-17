/**
 * Rajax Unit Controller
 */
const HttpStatus = require('http-status-codes');

const logger = require('../../../../utils/logger');
const errors = require('../../../../errors');

var middleware = {};
var endpoints = {};

/**
 * Middleware
 */
middleware.findUnit = function(req, res, next){

  let territory = req.app.locals.territory;
  let hundred = territory.current.hundred;

  let reqUnit = req.params.unit_number;

  let unit = null;

  try {
    unit = hundred.findUnit(reqUnit);
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

middleware.findSubunit = function(req, res, next){

  let reqSubunit = req.query.subunit || null;

  if(!reqSubunit) return next();

  let territory = req.app.locals.territory;
  let unit = territory.current.unit;

  let subunit = null;

  try {
    subunit = unit.findSubunit(reqSubunit);
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

/**
 * Endpoints
 */

// Visits
endpoints.addVisit = (req, res) => {

  let territory = req.app.locals.territory;
  let unit = territory.current.subunit || territory.current.unit;

  let visitData = _.pick(req.body, [
    'householders_contacted',
    'contacted_by',
    'details',
    'timestamp',
    'id'
  ]);

  let newVisit = unit.addVisit(visitData);

  territory.territory.save()
    .then(t => {
      return res.json({data: {id: newVisit._id.toString()}});
    })
    .catch(e => {
      console.log(e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    })

};

endpoints.removeVisit = (req, res) => {

  let visitId = req.query.id || null;

  if(!visitId){
    return res.status(HttpStatus.NOT_ACCEPTABLE).send();
  }

  let territory = req.app.locals.territory;
  let unit = territory.current.subunit || territory.current.unit;

  unit.removeVisit(visitId)

  territory.territory.save()
    .then(t => {
      return res.send();
    })
    .catch(e => {
      console.log(e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    })

};

module.exports = {middleware, endpoints};
