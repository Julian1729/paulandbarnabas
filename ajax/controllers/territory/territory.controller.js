/**
 * AJAX Territory controller
 */
/**
 * Create Territory Ajax Controller
 */
const {ObjectId} = require('mongodb');
const appRoot = require('app-root-path');
const HttpStatus = require('http-status-codes');

const errors = require(`${appRoot}/errors`);
const {territoryServices} = require(`${appRoot}/services`);
const {TerritoryModel, UserModel} = require(`${appRoot}/models`);
const {logger, helpers, AjaxResponse} = require(`${appRoot}/utils`);
const {CongregationNotFound, FragmentNotFound, FormValidationError} = require(`${appRoot}/errors`);
const {createTerritoryValidator, saveFragmentValidator} = require(`${appRoot}/utils/validators`);

/**
 * Save new territory into congregation
 * territory object. No units are overwritten,
 * they are simply skipped if they already exist.
 * OPTIMIZE: implement check if units already exist,
 * send back request with info asking admin if
 * they would like to overwrite.
 */
exports.saveBlock = async (req, res) => {

  let ajaxRes = new AjaxResponse(res);
  ajaxRes.validErrors = ['FORM_VALIDATION_ERROR'];

  let formData = helpers.collectFormData([
    'block_hundred',
    'odd_even',
    'units',
    'street',
    'new_street_name',
    'fragment_assignment',
    'fragment_unassigned'
  ], req);

  // consolidate street name
  formData.street_name = formData.street || formData.new_street_name;

  // validate form data
  let validationErrors = createTerritoryValidator(formData);
  if(validationErrors){
    return ajaxRes.error('FORM_VALIDATION_ERROR', null, {validationErrors: validationErrors}).send();
  }

  let territoryDoc = res.locals.territory;

  let newUnitCount = await territoryServices.saveBlock(territoryDoc, formData.street_name, formData.block_hundred, formData.odd_even, formData.units, (formData.fragment_unassigned === 'on' ? formData.fragment_assignment : null));

  ajaxRes.data('units_created', newUnitCount);
  if(formData.fragment_assignment) ajaxRes.data('fragment_assignment', formData.fragment_assignment);
  return ajaxRes.send();

};

exports.getStreetStats = (req, res) => {


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
      return helpers.ajaxResponse(res, {
        data: stats
      });

    })
    .catch(e => {

      if(e instanceof errors.StreetNotFound){
        return helpers.ajaxResponse(res, {
          status: 500,
          error: e
        });
      }else{
        return helpers.ajaxResponse(res, {
          status: 500
        });
      }

    });

};

exports.getFragments = (req, res) => {

  // var congregationId = dev.congregationId; // FIXME: this should come from session
  var congregationId = req.session.congregation;

  TerritoryModel.findOne({congregation: congregationId}, 'fragments')
    .then(result => {
      return helpers.ajaxResponse(res, {
        data: result.fragments
      });
    })
    .catch(e => {
      return helpers.ajaxResponse(res, {
        status: 500
      });
    })

};

exports.getStreets = (req, res) => {

  // var congregationId = dev.congregationId; // FIXME: this should come from session
  var congregationId = req.session.congregation;

  // find streets
  TerritoryModel.findByCongregation(congregationId)
    .then(territory => {
      return helpers.ajaxResponse(res, {
        data: territory.streets
      });
    })
    .catch(e => {
      if(e instanceof errors.TerritoryNotFound){
        return helpers.ajaxResponse(res, {
          status: 500,
          error: e
        });
      }

      return helpers.ajaxResponse(res, {
        status: 500
      });

    });

};

/**
 * Save or create a fragment on
 * territory object.
 */
exports.saveFragment = async (req, res) => {

  let ajaxRes = new AjaxResponse(res);
  ajaxRes.validErrors = ['FORM_VALIDATION_ERROR'];

  // validate fragment form data
  let validation = saveFragmentValidator(req.body);
  if(validation){
    return ajaxRes.error('FORM_VALIDATION_ERROR', null, {validationErrors: validation}).send();
  }

  let fragmentData = req.body.fragment;
  let territoryDoc = res.locals.territory;
  let fragment = await territoryServices.saveFragment(territoryDoc, fragmentData.number, fragmentData.blocks, fragmentData.assignment);

  let fragmentSummary = {number: fragment.number, blocks: fragmentData.blocks.length};
  if(fragmentData.assignment) fragmentSummary.assignedTo = fragmentData.assignment;
  ajaxRes.data('fragment', fragmentSummary);
  ajaxRes.send();

};

exports.getUnassignedFragments = (req, res) => {

  var congregation = req.session.congregation;

  if(!congregation){
    return res.status(HttpStatus.UNAUTHORIZED).send();
  }

  // query for fragments with empty assignment_history or last element "to" = null
  TerritoryModel.aggregate([
    {
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
        "$or": [
          {
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
        "fragments._id": 1,
        "fragments.assignment_history": {
          "$slice": ["$fragments.assignment_history", -1]
        },
        "size": {"$size":"$fragments.blocks"}
      }
    },

  ])
  .then(r => {
    // loop through returned and grab only needed information
    // OPTIMIZE: there has to be a way I can do this with aggregation
    // e.g. [ {id: ObjectId('asdfasdf'), number: 3}, ... ]
    var fragments = [];
    r.forEach(d => {
      fragments.push({
        id: d.fragments._id,
        number: d.fragments.number,
        block_count: d.size
      });
    });
    helpers.ajaxResponse(res, {
      data: fragments
    })
  })
  .catch(e => {
    console.log(e);
  });

};

exports.getAssignedFragments = (req, res) => {

    var congregation = req.session.congregation;
    var user_id = req.body.user_id;

    if(!congregation || !user_id){
      return res.status(HttpStatus.UNAUTHORIZED).send();
    }

    // query for fragments with empty assignment_history or last element "to" = null
    TerritoryModel.aggregate([
      {
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
        "$project": {
          "fragments.number": 1,
          "fragments._id": 1,
          "fragments.assignment_history": {
            "$slice": ["$fragments.assignment_history", -1]
          },
          "size": {"$size":"$fragments.blocks"}
        }
      },
      {
        "$match": {
          "fragments.assignment_history.to": ObjectId("5c69fc84a38f454a4e8687ac")
        }
      }
    ])
    .then(r => {
      // loop through returned and grab only needed information
      // OPTIMIZE: there has to be a way I can do this with aggregation
      // e.g. [ {id: ObjectId('asdfasdf'), number: 3}, ... ]
      console.log(r);
      var fragments = [];
      r.forEach(d => {
        fragments.push({
          id: d.fragments._id,
          number: d.fragments.number,
          block_count: d.size
        });
      });
      helpers.ajaxResponse(res, {
        data: fragments
      })
    })
    .catch(e => {
      console.log(e);
    });

};
