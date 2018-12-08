/**
 * Create Territory Ajax Controller
 */
const CreateTerritoryValidator = require('../../validators/CreateTerritory');
const {CongregationNotFound, FormValidationError} = require('../../errors');
const TerritoryModel = require('../../models/Territory');
const {ObjectId} = require('mongodb');
const logger = require('../../utils/logger');
const Utils = require('../../utils/utils');
const constants = require('../../config/config');

var saveTerritory = (req, res, next) => {

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

  // FIXME: hard coded congregation object id!!
  var hardcodedID = "5c01eb89ef008c67a6f77add";
  TerritoryModel.findOne({congregation: hardcodedID})
    .then(territory => {
      if(territory){
        logger.debug('congregation territory found');
        return territory;
      }else{
        throw new CongregationNotFound(`Territory with congregation ID ${hardcodedID} not found.`)
      }
    })

    // SEARCH FOR STREET IN DB, CREATE IT IF IT DOESN'T EXIST
    .then(territory => {
      var infoObj = {
        territory
      };
      // search for street name within array
      // check for street existence
      var foundStreet = null;
      for (var i = 0; i < territory.streets.length; i++) {
        var streetObj = territory.streets[i];
        if(streetObj.name === territoryData.street_name){
          foundStreet = streetObj;
          break;
        }
      }
      if(foundStreet){
        logger.debug(`${territoryData.street_name} street already exists`);
        infoObj.street = foundStreet;
        return infoObj;
      }

      logger.debug(`${territoryData.street_name} needs to be created`);
      // street doesn't exist...create it
      var newStreet = {
        name: territoryData.street_name
      };
      territory.streets.push(newStreet);
      return territory.save()
        .then(territory => {
          // return street
          var street = _.find(territory.streets, function(streetObj){
            return streetObj.name === newStreet.name;
          });
          if(!street) throw new Error('New street not found back in returned object from database.')
          logger.debug(`${street.name} street created`);
          return {
            territory,
            street
          };

        })
        // delegate to main catch
        .catch(e => { throw e; });
    })

    // SEARCH FOR BLOCK, CREATE IT IF IT DOESN'T EXIST
    .then(infoObj => {
      var streetSide = infoObj.territory.streets.id(infoObj.street._id)[territoryData.odd_even];
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

      //console.log('units', units);
      // save updated territory doc
      return infoObj.territory.save()
        .then(territory => {
          logger.debug(`${units.length} units added into block on ${territoryData.odd_even} side of ${infoObj.street.name}`);
        })
        .catch(e => {throw e});
    })

    .catch(e => {
      if(e instanceof CongregationNotFound){
        return ajaxResponse(res, {
          error: e
        });
      }else{
        console.log(e);
        return ajaxResponse(res, {
          status: 500
        });
      }
    });

};

module.exports = {
  saveTerritory
};
