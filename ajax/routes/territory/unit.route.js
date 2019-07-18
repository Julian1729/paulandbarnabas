/**
 * AJAX Unit router
 */

const express = require('express');
const router = express.Router({mergeParams: true});
const appRoot = require('app-root-path');

const {territoryMiddleware} = require(`${appRoot}/middleware`);
const {unitController} = require(`${appRoot}/ajax/controllers`);

router.use(territoryMiddleware.findRequestedUnit, territoryMiddleware.findRequestedSubunit);

// Visits
router.post('/visit/add', unitController.addVisit);
router.post('/visit/remove', unitController.removeVisit);

// Subunits
router.post('/subunit/add', unitController.addSubunit);
router.post('/subunit/remove', unitController.removeSubunit);

// Tags
router.post('/tag/add', unitController.addTag);
router.post('/tag/remove', unitController.removeTag);

// Householders
router.post('/householder/add', unitController.addHouseholder);
router.post('/householder/remove', unitController.removeHouseholder);

// Notes
router.post('/note/add', unitController.addNote);
router.post('/note/remove', unitController.removeNote);

// Metadata
// router.get('/meta', unitController.meta);
router.post('/meta', unitController.meta);

module.exports = router;
