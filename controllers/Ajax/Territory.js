/**
 * Create Territory Ajax Controller
 */
const HttpStatus = require('http-status-codes');
const {ObjectId} = require('mongodb');

const {CongregationNotFound, FragmentNotFound, FormValidationError} = require('../../errors');
const CreateTerritoryValidator = require('../../validators/CreateTerritory');
const CreateFragmentValidator = require('../../validators/CreateFragment');
const TerritoryModel = require('../../models/Territory');
const {UserSession} = require('../../session/session');
const UserModel = require('../../models/User');
const {ajaxResponse} = require('./Base');
const logger = require('../../utils/logger');
const Utils = require('../../utils/utils');
const constants = require('../../config/config');
const errors = require('../../errors');

var saveTerritory = (req, res, next) => {

  var congregationId = req.session.congregation || null;

  if(congregationId === null) return ajaxResponse(res, {
    status: HttpStatus.UNAUTHORIZED,
    error: new errors.SessionUnauthenticated()
  }, HttpStatus.UNAUTHORIZED);

  var territoryData = Utils.collectFormData([
    'block_hundred',
    'odd_even',
    'units',
    'street',
    'new_street_name',
    'fragment_assignment',
    'fragment_unassigned'
  ], req);

  // consolidate street name
  territoryData.street_name = territoryData.street || territoryData.new_street_name;

  // VALIDATE INPUT
  var validation = CreateTerritoryValidator(territoryData);
  if(validation){
    logger.debug('validation error\n' + JSON.stringify(validation, null, 2))
    return ajaxResponse(res, {
      error: new FormValidationError(validation)
    })
  }

  TerritoryModel.findByCongregation(congregationId)
    // SEARCH FOR STREET IN DB, CREATE IT IF IT DOESN'T EXIST
    .then(territory => {

      // preserve references to prominent
      // documents within territory
      var infoObj = {
        territory
      };
      // attempt to add street
      try {
        infoObj.street = territory.addStreet(territoryData.street_name);
        logger.debug(`${territoryData.street_name} has been created`);
      } catch (e) {
        if(e instanceof errors.StreetAlreadyExists){
          logger.debug(`${territoryData.street_name} street already exists`);
          infoObj.street = territory.findStreet(territoryData.street_name);
        }else{
          throw e;
        }
      } finally {
        return infoObj;
      }
    })

    // FIND HUNDRED AND INSERT UNITS
    .then(infoObj => {

      try {
        infoObj.hundred = infoObj.street.addHundred(territoryData.block_hundred);
        logger.debug(`${territoryData.block_hundred} of ${infoObj.street.name} created`);
      } catch (e) {
        if(e instanceof errors.HundredAlreadyExists){
          infoObj.hundred = infoObj.street.findHundred(territoryData.block_hundred);
          logger.debug(`${territoryData.block_hundred} of ${infoObj.street.name} exists`);
        }else{
          throw e;
        }
      } finally {
        infoObj.block = infoObj.hundred[territoryData.odd_even];
        infoObj.hundred.addUnits(territoryData.units, {skipDuplicates: true});
        return infoObj;
      }

    })
    // UPDATE FRAGMENT ASSIGNMENT
    .then(infoObj => {
      // assign block to fragment if the "leave fragment unassigned" button is not checked
      if(territoryData.fragment_unassigned !== "on"){
        var fragment = infoObj.territory.findFragment(territoryData.fragment_assignment);
        fragment.assignBlocks([infoObj.block._id], infoObj.territory);
        logger.debug(`Block assigned to fragment #${territoryData.fragment_assignment}`);
      }else{
        logger.debug(`Block left unassigned`);
      }
      return infoObj.territory.save();
    })
    .then(territory => {
      return ajaxResponse(res);
    })
    .catch(e => {
      if(e instanceof CongregationNotFound || e instanceof FragmentNotFound){
        return ajaxResponse(res, {
          error: e
        });
      }else{
        logger.debug(e.stack);
        return ajaxResponse(res, {
          status: 500
        });
      }
    });

};

var getStreetStats = (req, res, next) => {


  // var congregationId = dev.congregationId; // FIXME: this should come from session
  var congregationId = req.session.congregation;
  var streetToFind = req.body.street;
  // store street statistics {hundred: 4500, unit_counts: {odd: 10, even: 0}}
  var stats = [];
  // find blocks
  TerritoryModel.findByCongregation(congregationId)
    .then(territory => {
      var street = territory.findStreet(streetToFind);
      // loop through hundreds
      street.hundreds.forEach(h => {
        var statObj = {hundred: null, unit_counts: {odd: 0, even: 0}};
        statObj.hundred = h.hundred;
        statObj.unit_counts.odd = h.odd.units.length;
        statObj.unit_counts.even = h.even.units.length;
        statObj.odd_id = h.odd._id;
        statObj.even_id = h.even._id;
        stats.push(statObj);
      });
      return ajaxResponse(res, {
        data: stats
      });

    })
    .catch(e => {

      if(e instanceof errors.StreetNotFound){
        return ajaxResponse(res, {
          status: 500,
          error: e
        });
      }else{
        return ajaxResponse(res, {
          status: 500
        });
      }

    });

};

var getFragments = (req, res, next) => {

  // var congregationId = dev.congregationId; // FIXME: this should come from session
  var congregationId = req.session.congregation;

  TerritoryModel.findOne({congregation: congregationId}, 'fragments')
    .then(result => {
      return ajaxResponse(res, {
        data: result.fragments
      });
    })
    .catch(e => {
      return ajaxResponse(res, {
        status: 500
      });
    })

};

var getStreets = (req, res, next) => {

  // var congregationId = dev.congregationId; // FIXME: this should come from session
  var congregationId = req.session.congregation;

  // find streets
  TerritoryModel.findByCongregation(congregationId)
    .then(territory => {
      return ajaxResponse(res, {
        data: territory.streets
      });
    })
    .catch(e => {
      if(e instanceof errors.TerritoryNotFound){
        return ajaxResponse(res, {
          status: 500,
          error: e
        });
      }

      return ajaxResponse(res, {
        status: 500
      });

    });

};

var saveFragment = (req, res, next) => {

  var fragmentData = req.body;
  // validate fragment
  var validation = CreateFragmentValidator(fragmentData);
  if(validation){
    return ajaxResponse(res, {
      error: new FormValidationError(validation)
    });
  }

  // create fragement

};

module.exports = {
  saveTerritory,
  getStreetStats,
  getStreets,
  getFragments,
  saveFragment
};
