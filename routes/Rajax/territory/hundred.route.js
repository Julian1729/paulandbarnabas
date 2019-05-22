/**
 * Hundred Ajax Router
 */

const express = require('express');
const router = express.Router({mergeParams: true});
const appRoot = require('app-root-path');
const HttpStatus = require('http-status-codes');

const {hundredController} = require(`${appRoot}/controllers/ajax/territory/index`);
const blockRoute = require('./block.route');
const unitRoute = require('./unit.route');

/**
 * Middleware
 */
 router.all('*', hundredController.middleware.findHundred);

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
  router.post('/units/add', hundredController.endpoints.addUnits);

  // Delegate to block router
  router.use('/block/:side', blockRoute);

  router.use('/unit/:unit_number', unitRoute);

module.exports = router;
