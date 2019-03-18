/**
 * Unit Rajax Router
 */

const express = require('express');
const router = express.Router({mergeParams: true});
const HttpStatus = require('http-status-codes');

const controller = require('../../../controllers/Rajax/Territory/subcontrollers/unit');

/**
 * Middleware
 */
router.use(controller.middleware.findUnit, controller.middleware.findSubunit);




/**
 * Endpoints
 */
router.get('/test', (req, res) => {

  let territory = req.app.locals.territory;
  let unit = territory.current.unit;

  if(req.query.subunit){
    if(!territory.current.subunit){
      console.log('no subunit');
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  if(!unit){
    console.log('no unit');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
  }

  res.send();

});

// Visits
router.post('/visit/add', controller.endpoints.addVisit);
router.post('/visit/remove', controller.endpoints.removeVisit);

// Subunits
router.post('/subunit/add', controller.endpoints.addSubunit);
router.post('/subunit/remove', controller.endpoints.removeSubunit);

// Tags
router.post('/tag/add', controller.endpoints.addTag);
router.post('/tag/remove', controller.endpoints.removeTag);

// Householders
router.post('/householder/add', controller.endpoints.addHouseholder);
router.post('/householder/remove', controller.endpoints.removeHouseholder);



module.exports = router;
