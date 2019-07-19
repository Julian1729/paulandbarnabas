/**
 * AJAX Block controller
 */
const appRoot = require('app-root-path');
const HttpStatus = require('http-status-codes');

const errors = require(`${appRoot}/errors`);
const {logger, AjaxResponse} = require(`${appRoot}/utils`);
const {territoryServices} = require(`${appRoot}/services`);

exports.addTag = async (req, res) => {

  let ajaxRes = new AjaxResponse(res);
  ajaxRes.validErrors = ['MISSING_TAG'];

  let tag = req.query.tag;

  if(!tag){
    return ajaxRes.error('MISSING_TAG').send();
  }

  let territoryDoc = res.locals.territory;
  let block = res.locals.collected.block;

  let newTag = await territoryServices.addTag(territoryDoc, block, tag);

  return ajaxRes.data('tag', newTag).send();

};

exports.removeTag = async (req, res) => {

  let ajaxRes = new AjaxResponse(res);
  ajaxRes.validErrors = ['MISSING_TAG'];

  let tag = req.query.tag;

  if(!tag){
    return ajaxRes.error('MISSING_TAG').send();
  }

  let territoryDoc = res.locals.territory;
  let block = res.locals.collected.block;

  await territoryServices.removeTag(territoryDoc, block, tag);

  return ajaxRes.send();

};

exports.markWorked = async (req, res) => {

  let territoryDoc = res.locals.territory;
  let block = res.locals.collected.block;

  let timestamp = req.query.time;

  await territoryServices.markBlockWorked(territoryDoc, block, timestamp);

  return res.send();

};
