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

      try {
        infoObj.street = territory.addStreet(territoryData.street_name);
        logger.debug(`${territoryData.street_name} created`);
      } catch (e) {
        if(e instanceof errors.StreetAlreadyExists){
          logger.debug(`${territoryData.street_name} street already exists`);
          infoObj.street = foundStreet;
          return infoObj;
        }
      }

      return infoObj;
    })

    // SEARCH FOR BLOCK, CREATE IT IF IT DOESN'T EXIST
    .then(infoObj => {
      var streetSide = infoObj.territory.streets.id(infoObj.street._id)[territoryData.odd_even];
      // FIXME: use find block method here
      var block = _.find(streetSide, function(blockObj){
        return blockObj.hundred == territoryData.block_hundred;
      });
      // if the block exists, simply go to next step (inserting units)
      // OPTIMIZE: should the user be alerted since an existing block will be overwritten
      if(block){
        logger.debug(`${block.hundred} block of ${infoObj.street.name} already exists and will be overwritten`);
        infoObj.block = block;
        return infoObj;
      }
      logger.debug(`${territoryData.block_hundred} of ${infoObj.street.name} needs to be created`);
      // FIXME: use addBlock on street document
      // block must be created
      var newBlockId = new ObjectId();
      var newBlock = {
        _id: newBlockId,
        hundred: territoryData.block_hundred
      };
      // inject new block
      streetSide.push(newBlock);
      return infoObj.territory.save()
        .then(territory => {
          var block = territory.streets.id(infoObj.street._id)[territoryData.odd_even].id(newBlockId);
          infoObj.block = block;
          logger.debug(`${infoObj.block.hundred} block of ${infoObj.street.name} created`);
          return infoObj;
        })
        .catch(e => {throw e});
    })

    // INSERT UNITS
    .then(infoObj => {
      var units = infoObj.block.units;
      // WARNING: I have no idea why emptying the array had
      // to be done this way. For some reason setting it to an empty array
      // didnt work when saved to mongoose. https://github.com/Automattic/mongoose/issues/1126
      while(units.length > 0) {
          units.pop();
      }
      // FIXME: use addUnits method
      // loop through units, create base unit object, and insert into array
      territoryData.units.forEach(unitObj => {
        var unitBase = {};
        unitBase.number = unitObj.number;
        // loop through subunits if they exist
        if(unitObj.subunits){
          // create empty subunits array
          unitBase.subunits = [];
          unitObj.subunits.forEach(name => {
            // create subunit object and add to array
            var subunit = {name};
            unitBase.subunits.push(subunit);
          });
        }
        // add unit into block
        units.push(unitBase);
      });

      // save updated territory doc
      return infoObj.territory.save()
        .then(territory => {
          logger.debug(`${units.length} units added into block on ${territoryData.odd_even} side of ${infoObj.street.name}`);
          return infoObj;
        })
        .catch(e => {throw e});
    })
    // UPDATE FRAGMENT ASSIGNMENT
    .then(infoObj => {
      if(territoryData.fragment_unassigned !== null) return;
      var fragmentNumber = territoryData.fragment_assignment;
      // FIXME: depricate assignBlockToFragment and utilize findFragment().addBlocks()
      infoObj.territory
        .assignBlockToFragment(fragmentNumber, infoObj.block._id)
        .then(territory => {
          logger.debug(`block saved into fragment ${fragmentNumber}`);
          return ajaxResponse(res, {
            territorySaved: true
          });
        })
        .catch(e => {throw e});
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

var getBlocks = (req, res, next) => {


  // var congregationId = dev.congregationId; // FIXME: this should come from session
  var congregationId = req.session.congregation;
  var street = req.body.street;
  // find blocks
  TerritoryModel.findByCongregation(congregationId)
    .then(territory => {
      // get block from street
      var blocks = territory
        .findStreet(street)
        .getBlocks();

      return ajaxResponse(res, {
        data: blocks
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
          status: 500,
          error: e
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
  getBlocks,
  getStreets,
  getFragments,
  saveFragment
};
