const express = require('express');
var router = express.Router();

const {NonExistentController, NonExistentAction} = require('../errors');
const logger = require('../utils/logger');
const Utils = require('../utils/utils');

const relativePath = '../controllers/Ajax';

var dispatch = (req, res, next) => {

  var requestedController = req.params.controller;
  var requestedAction = req.params.action;

  // correct case in params
  requestedController = Utils.pascualCase(requestedController);
  requestedAction = Utils.camelCase(requestedAction);

  logger.debug(`${requestedController} is controller`);
  logger.debug(`${requestedAction} is action`);

  var controller = null;
  // attempt to require controller file
  try {
    controller = require(`${relativePath}/${requestedController}`);
  } catch (e) {
    // only catch if e.code === "MODULE_NOT_FOUND"
    if(e.code === "MODULE_NOT_FOUND"){
      // module was unable to be located, respond with 404
      var error = new NonExistentController(`"${requestedController}" is not a valid controller"`);
      console.log(e);
      return res.status(404).send(error);
    }
    // re throw error
    throw e;
  }
  // handle non-existent action
  if(!controller[requestedAction]){
    var error = new NonExistentAction(`"${requestedAction}" is not a valid action"`);
    logger.debug(error);
    return res.status(404).send(error);
  }

  controller[requestedAction](req, res, next);

};

// OPTIMIZE: Add middleware that checks referrer is
// from paul and barnabas
router.get('/:controller/:action', dispatch);
router.post('/:controller/:action', dispatch);

module.exports = router;
