/**
 * Hundred Rajax Router
 * /rajax/territory/street/:street_name/hundred/:hundred
 */

const express = require('express');
const router = express.Router({mergeParams: true});
const HttpStatus = require('http-status-codes');

const controller = require('../../../controllers/Rajax/Territory/subcontrollers/block');
const logger = require('../../../utils/logger');

/**
 * Middleware
 */
router.use(controller.middleware.findBlock);

/**
 * Endpoints
 */
router.get('/test', (req, res) => {

  let territory = req.app.locals.territory;
  if(!territory.current.block){
    throw new Error('block not passed in on middleware');
    res.send(HttpStatus.INTERNAL_SERVER_ERROR).send();
  }
  return res.send();

});

module.exports = router;
