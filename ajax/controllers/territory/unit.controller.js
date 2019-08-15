const _ = require('lodash');
const moment = require('moment');
const appRoot = require('app-root-path');
const HttpStatus = require('http-status-codes');

const {AjaxResponse} = require(`${appRoot}/utils`);
const {validators} = require(`${appRoot}/utils`);
const {territoryServices} = require(`${appRoot}/services`);

/**
 * Add a visit record to a unit
 * Expecting in body: 'householders_contacted', 'contacted_by', 'details', 'timestamp', 'id'
 */
exports.addVisit = async (req, res) => {

  let ajaxRes = new AjaxResponse(res);
  ajaxRes.validErrors = ['VALIDATION_ERROR'];

  let territoryDoc = res.locals.territory;
  let unit = res.locals.collected.subunit || res.locals.collected.unit;

  let visitData = req.body.visit;

  let validationErrors = validators.householderContactedValidator(visitData);
  if(validationErrors){
    return ajaxRes.error('VALIDATION_ERROR', null, {validationErrors}).send();
  }

  // construct timestamp with time and date
  let timestamp = moment( `${visitData.date} ${visitData.time}`, 'MMMM Do, YYYY h:mm A' ).valueOf();

  visitData.timestamp = timestamp;
  delete visitData.date;
  delete visitData.time;

  // rename publisher to contacted_by
  // FIXME: this is sloppy
  visitData.contacted_by = visitData.publisher;
  delete visitData.publisher;

  let visit = await territoryServices.visitUnit(territoryDoc, unit, visitData);

  // add visit to response data object and send response
  return ajaxRes.data('visit', visit).send();

};

/**
 * Delete a visit record from a unit
 * Expecting in query: visit id
 * // FIXME: refactor
 */
// exports.removeVisit = (req, res) => {
//
//   let visitId = req.query.id || null;
//
//   if(!visitId){
//     return res.status(HttpStatus.NOT_ACCEPTABLE).send();
//   }
//
//   let territory = req.app.locals.territory;
//   let unit = territory.current.subunit || territory.current.unit;
//
//   unit.removeVisit(visitId)
//
//   territory.territory.save()
//     .then(t => {
//       return res.send();
//     })
//     .catch(e => {
//       console.log(e.stack);
//       return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
//     })
//
// };

/**
 * Add subunits to unit
 * Expecting in body: { subunits: [ {name: 'Apt 1'}, {name: 'Apt 2'} ] }
 * OPTIMIZE: refactor addSubunits to allow adding more than just a name
 * and allow more than just a name to be send in body
 */
// exports.addSubunit = (req, res) => {
//
//   let territory = req.app.locals.territory;
//   let unit = territory.current.unit;
//
//   let subunitsToAdd = req.body.subunits;
//
//   subunitsToAdd.forEach(subunitObj => {
//     unit.addSubunit(subunitObj.name);
//   });
//
//   territory.territory.save()
//     .then(t => {
//       return res.send({
//         data: {
//           subunits: unit.subunits
//         }
//       });
//     })
//     .catch(e => {
//       console.log(e.stack);
//       return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
//     })
//
// };

/**
 * Remove subunit
 * Expecting in query: subunit id
 * // FIXME: refactor
 */
// exports.removeSubunit = (req, res) => {
//
//   let reqSubunitId = req.query.id;
//   if(!reqSubunitId) return res.status(HttpStatus.NOT_ACCEPTABLE).send();
//
//   let territory = req.app.locals.territory;
//   let unit = territory.current.unit;
//
//   unit.removeSubunit(reqSubunitId);
//
//   territory.territory.save()
//     .then(t => {
//       return res.send();
//     })
//     .catch(e => {
//       console.log(e.stack);
//       return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
//     })
//
// };

/**
 * Add tag to unit or subunit
 */
exports.addTag = async (req, res) => {

  let ajaxRes = new AjaxResponse(res);

  let tag = req.query.tag;
  if(!tag) return res.status(HttpStatus.NOT_ACCEPTABLE).send();

  let territoryDoc = res.locals.territory;
  let unit = res.locals.collected.subunit || res.locals.collected.unit;

  let newTag = await territoryServices.addTag(territoryDoc, unit, tag);

  return ajaxRes.data('tag', newTag).send();

};

/**
 * Remove tag from unit or subunit
 * // FIXME: refactor and implement
 */
// exports.removeTag = (req, res) => {
//
//   let reqTag = req.query.tag;
//   if(!reqTag) return res.status(HttpStatus.NOT_ACCEPTABLE).send();
//
//   let territory = req.app.locals.territory;
//   let unit = territory.current.subunit || territory.current.unit;
//
//   unit.removeTag(reqTag);
//
//   territory.territory.save()
//     .then(t => {
//       return res.send();
//     })
//     .catch(e => {
//       console.log(e.stack);
//       res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
//     });
//
// };

/**
 * Add housholder to unit or subunit
 */
exports.addHouseholder = async (req, res) => {

  let ajaxRes = new AjaxResponse(res);
  ajaxRes.validErrors = ['VALIDATION_ERROR'];

  let householderInfo = req.body.householder;

  // validate householder
  let validationErrors = validators.addHouseholderValidator(householderInfo);
  if(validationErrors){
    return ajaxRes.error('VALIDATION_ERROR', null, {validationErrors}).send();
  }

  let territoryDoc = res.locals.territory;
  let unit = res.locals.collected.subunit || res.locals.collected.unit;

  let newHouseholder = await territoryServices.addUnitHouseholder(territoryDoc, unit, householderInfo);

  return ajaxRes.data('householder', newHouseholder).send();

};

/**
 * Remove a housholder from unit
 */
// exports.removeHouseholder = (req, res) => {
//
//   let reqHouseholder = req.query.id;
//   if(!reqHouseholder) return res.status(HttpStatus.NOT_ACCEPTABLE).send();
//
//   let territory = req.app.locals.territory;
//   let unit = territory.current.subunit || territory.current.unit;
//
//   unit.removeHouseholder(reqHouseholder);
//
//   territory.territory.save()
//     .then(t => {
//       return res.send();
//     })
//     .catch(e => {
//       console.log(e.stack);
//       return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
//     });
//
// };

/**
 * Add a note to unit or subunit
 */
exports.addNote = async (req, res) => {

  let ajaxRes = new AjaxResponse(res);

  let territoryDoc = res.locals.territory;
  let unit = res.locals.collected.subunit || res.locals.collected.unit;

  let noteData = req.body.note;
  if(!noteData) return res.status(HttpStatus.NOT_ACCEPTABLE).send();

  let note = await territoryServices.addNote(territoryDoc, unit, noteData);

  ajaxRes.data('note', note).send();

};

/**
 * Remove note from unit or subunit
 */
// exports.removeNote = (req, res) => {
//
//   let noteId = req.query.id;
//   if(!noteId) return res.status(HttpStatus.NOT_ACCEPTABLE).send();
//
//   let territory = req.app.locals.territory;
//   let unit = territory.current.subunit || territory.current.unit;
//
//   unit.removeNote(noteId);
//
//   territory.territory.save()
//     .then(t => {
//       return res.send();
//     })
//     .catch(e => {
//       console.log(e.stack);
//       return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
//     });
//
// };

/**
 * Set a meta property on unit
 * Expected in query: dnc || lang || calledon || name
 * (isdonotcall)
 * (language)
 * (iscalledon)
 * (name)
 */
exports.setMeta = async (req, res) => {

  let ajaxRes = new AjaxResponse(res);

  let territoryDoc = res.locals.territory;
  let unit = res.locals.collected.subunit || res.locals.collected.unit;

  let metaField = null;
  let value = null;
  // search for valid metaField in query
  // and store in metaField var
  ['dnc', 'lang', 'calledon', 'name'].forEach(opt => {
    if(req.query.hasOwnProperty(opt)){
      value = req.query[opt];
      return metaField = opt;
    }
  });

  // metaField query must be present
  if(!metaField){
    return res.status(HttpStatus.NOT_ACCEPTABLE).send();
  }

  await territoryServices.setUnitMeta(territoryDoc, unit, metaField, value);

  return ajaxRes.data('field', metaField).data('value', value).send();

};
