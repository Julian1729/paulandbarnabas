/**
 * Unit Rajax Router
 */

const express = require('express');
const router = express.Router({mergeParams: true});
const appRoot = require('app-root-path');

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
