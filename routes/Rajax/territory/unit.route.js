/**
 * Unit Rajax Router
 */

const express = require('express');
const router = express.Router({mergeParams: true});
const appRoot = require('app-root-path');
const HttpStatus = require('http-status-codes');

const {unitController} = require(`${appRoot}/controllers/ajax/territory/index`);

/**
 * Middleware
 */
router.use(unitController.middleware.findUnit, unitController.middleware.findSubunit);

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
router.post('/visit/add', unitController.endpoints.addVisit);
router.post('/visit/remove', unitController.endpoints.removeVisit);

// Subunits
router.post('/subunit/add', unitController.endpoints.addSubunit);
router.post('/subunit/remove', unitController.endpoints.removeSubunit);

// Tags
router.post('/tag/add', unitController.endpoints.addTag);
router.post('/tag/remove', unitController.endpoints.removeTag);

// Householders
router.post('/householder/add', unitController.endpoints.addHouseholder);
router.post('/householder/remove', unitController.endpoints.removeHouseholder);

// Notes
router.post('/note/add', unitController.endpoints.addNote);
router.post('/note/remove', unitController.endpoints.removeNote);

// Metadata
// router.get('/meta', unitController.endpoints.meta);
router.post('/meta', unitController.endpoints.meta);



module.exports = router;
