/**
 * Street Ajax Router
 */

const express = require('express');
const router = express.Router({mergeParams: true});
const appRoot = require('app-root-path');
const HttpStatus = require('http-status-codes');

const {streetController} = require(`${appRoot}/controllers/ajax/territory/index`);
const hundredRoute = require('./hundred.route');

/**
 * Middleware
 */
router.use(streetController.middleware.findStreet);

/**
 * Endpoints
 */
router.get('/test', (req, res, next) => {
  let territory = req.app.locals.territory;
  if(!territory.current.street){
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
  }
  res.send({street: territory.current.street});
});

router.post('/remove', (req, res) => {
  res.status(HttpStatus.NOT_IMPLEMENTED).send(`NOT CONFIGURED: /street/${req.params.street_name}/remove`);
});

router.use('/hundred/:hundred', hundredRoute);

// OPTIMIZE: add /hundred/add to add and remove hundreds

module.exports = router;
