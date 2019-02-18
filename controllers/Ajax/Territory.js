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

  // OPTIMIZE: Use and finish commented code below to send back a summary of what was updated
  // to be display inside of success modal.

  // var summary = {};
  // _.defaults(summary, {
  //   hundred: territoryData.block_hundred,
  //   odd_even: territoryData.odd_even
  //   street: {
  //     new: false,
  //     name: null
  //   },
  //   fragmentassignment
  // });

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

  var congregation = req.session.congregation;
  var fragmentFormData = req.body;
  // fragmentFormData e.g
    // "fragment": {
    //   "number": "34",
    //   "assignment": "5c5a640585445f61eaf2147d",
    //   "data": [
    //     {
    //       "name": "Wakeling",
    //       "blocks": [
    //         {
    //           "hundred": 1200,
    //           "odd_even": "odd",
    //           "id": "5c5a640585445f61eaf21493"
    //         },
    //         {
    //           "hundred": 1200,
    //           "odd_even": "even",
    //           "id": "5c5a640585445f61eaf2149e"
    //         }
    //       ]
    //     }
    //   ]
    // }

  // validate fragment
  var validation = CreateFragmentValidator(fragmentFormData);
  if(validation){
    return ajaxResponse(res, {
      error: new FormValidationError(validation)
    });
  }

  // climb down excess "fragment" object
  fragmentData = fragmentFormData.fragment;

  // create fragment
  TerritoryModel.findByCongregation(congregation)
    .then(territory => {
      // CREATE FRAGMENT
      // WARNING: fragment is automatically added
      // with overwrite param, to optimize, ask user to
      // if they would like to overwrite
      var fragment = territory.addFragment(fragmentData.number, {overwriteFragment: true});
      // ASSIGN BLOCKS
      var blockIds = [];
      fragmentData.data.forEach(street => {
        street.blocks.forEach(block => blockIds.push(block.id));
      });
      // WARNING: if the auto overwrite option is removed
      // assign blocks can possibly throw BlocksAlreadyAssignedToFragment
      fragment.assignBlocks(blockIds, null, {skipDuplicatesCheck: true});
      // check for fragment holder assignment
      if(fragmentData.assignment && ObjectId.isValid(fragmentData.assignment)){
        fragment.assignHolder(fragmentData.assignment);
      }
      return territory.save();
    })
    .then(territory => {
      // all done!
      return ajaxResponse(res);
    })
    .catch(e => {
      throw e;
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    });

};

var getUnassignedFragments = (req, res, next) => {

  var congregation = req.session.congregation;

  if(!congregation){
    return res.status(HttpStatus.UNAUTHORIZED).send();
  }

  // query for fragments with empty assignment_history or last element "to" = null
  TerritoryModel.aggregate([{
      "$match": {
        "congregation": ObjectId("5c69fc84a38f454a4e8687ab")
      }
    },
    {
      "$limit": 1
    },
    {
      "$unwind": {
        "path": "$fragments"
      }
    },
    {
      "$match": {
        "$or": [{
            "fragments.assignment_history.to": null
          },
          {
            "fragments.assignment_history.to": {
              "$exists": false
            }
          }
        ]
      }
    },
    {
      "$project": {
        "fragments.number": 1,
        "fragments.assignment_history": {
          "$slice": ["$fragments.assignment_history", -1]
        }
      }
    }
  ])
  .then(r => {
    res.send(r)
    console.log(r);
  })
  .catch(e => {
    e.printStack();
  })

};

module.exports = {
  saveTerritory,
  getStreetStats,
  getStreets,
  getFragments,
  saveFragment,
  getUnassignedFragments
};
