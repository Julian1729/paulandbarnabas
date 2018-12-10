// OPTIMIZE: Split all controllers into individual files and load file from router
// based on their name
const _ = require('lodash');
const HttpStatus = require('http-status-codes'); //
const mongoose = require('mongoose');
const {ObjectId} = require('mongodb');

const {UserNotFound, FormValidationError, InvalidCredentials, CongregationNotFound} = require('../errors.js');
const CreateTerritoryValidator = require('../validators/CreateTerritory');
const SignUpValidator = require('../validators/SignUpValidator'); //
const LoginValidator = require('../validators/LoginValidator'); //
const constants = require('../config/constants');
const TerritoryModel = require('../models/Territory'); //
const UserModel = require('../models/User');
const logger = require('../utils/logger');//
const controllerBase = require('./base');
const Utils = require('../utils/utils'); //

/**
 * Send back a standard JSON response to an ajax request
 * @param  {[Object]} res Express response object to be able to execute response
 * @param  {[Object]} options Object used to pass in options {status: (http status code, default 200), message: {String}, data: null | object, validation: validation errors obj}
 * @param  {[Number]} httpStatus HTTP status code
 * @return {[void]}
 */
var ajaxResponse = (res, options, httpStatus) => {

  var responseBase = {
    status: HttpStatus.OK,
    data: null,
    error: null
  };

  var response = _.extend({}, responseBase, options);

  if(httpStatus){
    res.status(httpStatus).json(response);
  }else{
    res.json(response);
  }

  return;

};



module.exports = {
  'sign-up': signUp,
  'login': login,
  'create-territory': createTerritory
};
