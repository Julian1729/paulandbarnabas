/**
 * Street Rajax Router
 * /rajax/territory/street
 */

const express = require('express');
const router = express.Router({mergeParams: true});
const HttpStatus = require('http-status-codes');

const controller = require('../../../controllers/Rajax/Territory/subcontrollers/street');

/**
 * Middleware
 */
router.use(controller.middleware.findStreet);

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

router.use('/hundred/:hundred', require('./hundred'));

// OPTIMIZE: add /hundred/add to add and remove hundreds

module.exports = router;
