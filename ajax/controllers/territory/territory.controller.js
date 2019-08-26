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
const {TerritoryModel} = require(`${appRoot}/models`);
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

  let newUnitCount = await territoryServices.saveBlock(territoryDoc, formData.street_name, formData.block_hundred, formData.odd_even, formData.units, (formData.fragment_unassigned !== 'on' ? formData.fragment_assignment : null));

  ajaxRes.data('units_created', newUnitCount);
  if(formData.fragment_assignment) ajaxRes.data('fragment_assignment', formData.fragment_assignment);
  return ajaxRes.send();

};

exports.getStreetStats = (req, res) => {

  let ajaxRes = new AjaxResponse(res);
  ajaxRes.validErrors = ['STREET_NOT_FOUND'];

  let streetName = req.params.street_name;
  let stats = null;
  try {
    stats = territoryServices.streetStats(res.locals.territory, streetName);
  } catch (e) {
    if(e instanceof errors.StreetNotFound){
      return ajaxRes.error('STREET_NOT_FOUND', `"${streetName}" not found in congregation's territory`).send();
    }else{
      throw e;
    }
  }
  return ajaxRes.data('stats', stats).send();

};

// OPTIMIZE: extract the loading of framgent into middleware
// to be used in future fragment routes
exports.getFragmentStats = async (req, res) => {

  let ajaxRes = new AjaxResponse(res);
  ajaxRes.validErrors = ['FRAGMENT_NOT_FOUND'];

  let fragmentNumber = req.params.fragment_number;

  let stats = null;
  try{
    stats = await territoryServices.fragmentStats(res.locals.territory, fragmentNumber);
  }catch(e){
    if(e instanceof errors.FragmentNotFound){
      return ajaxRes.error('FRAGMENT_NOT_FOUND', `Fragment #${fragmentNumber} not found in congregation's territory.`).send();
    }else{
      throw e;
    }
  }
  return ajaxRes.data('stats', stats).send();

};

/**
 * Respond with stats for all
 * fragments in the congregations territory
 */
exports.getAllFragmentStats = async (req, res) => {

  let ajaxRes = new AjaxResponse(res);

  let stats = [];
  // loop through all fragments and call stat service
  for(let fragment of res.locals.territory.fragments){
    let fragmentStats = await territoryServices.fragmentStats(res.locals.territory, fragment.number);
    stats.push(fragmentStats);
  }

  return ajaxRes.data('fragments', stats).send();

};

/**
 * Respond with stats for all
 * all streets in congregations territory
 * OPTIMIZE: this logic could be extracted and made
 * into a teritory service
 */
exports.getAllStreetStats = (req, res) => {

  let ajaxRes = new AjaxResponse(res);

  let stats = [];
  // loop through all streets in territory and get stats
  for (let street of res.locals.territory.streets) {
    let streetStats = territoryServices.streetStats(res.locals.territory, street.name);
    streetStats.name = street.name;
    stats.push(streetStats);
  }

  return ajaxRes.data('streets', stats).send();

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
  // OPTIMIZE: overwriteAssigments is true by default,
  // catch error and alert user of what blocks have been assigned
  // and resend request with / or send a query param with overwrite=true
  // the query param switch would need to be implemented in this controller
  let fragment = await territoryServices.saveFragment(territoryDoc, fragmentData.number, fragmentData.blocks, fragmentData.assignment, {overwriteAssignments: true});

  let fragmentSummary = {number: fragment.number, blocks: fragmentData.blocks.length};
  if(fragmentData.assignment) fragmentSummary.assignedTo = fragmentData.assignment;
  ajaxRes.data('fragment', fragmentSummary);
  ajaxRes.send();

};
