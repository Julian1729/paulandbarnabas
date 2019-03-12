/**
 * Hundred Rajax Router
 * /rajax/territory/street/:street_name/hundred/:hundred
 */

const express = require('express');
const router = express.Router({mergeParams: true});
const HttpStatus = require('http-status-codes');

const controller = require('../../../controllers/Rajax/Territory/subcontrollers/hundred');

/**
 * Middleware
 */
 router.all('*', controller.middleware.findHundred);

/**
 * Endpoints
 */

  // test route middleware
  router.get('/test', (req, res) => {
    if(!req.app.locals.territory.current.street){
      throw new Error('street not passed on in middlware');
    }
    res.send();
  });

  // Units
  router.post('/units/add', controller.endpoints.addUnits);

  // Delegate to block router
  router.use('/block/:side', require('./block'));

// router.use('/:street_name/hundred', require('./hundred'));

module.exports = router;
