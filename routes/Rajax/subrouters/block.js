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

  // add / remove tags
  router.post('/tag/add', controller.endpoints.addTag);
  router.post('/tag/remove', controller.endpoints.removeTag);

  // add worked record
  router.post('/worked', controller.endpoints.addWorkedRecord);

module.exports = router;
