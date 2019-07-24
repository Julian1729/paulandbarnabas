/**
 * AJAX Unit router
 */

const express = require('express');
const router = express.Router({mergeParams: true});
const appRoot = require('app-root-path');

const {territoryMiddleware} = require(`${appRoot}/middleware`);
const {unitController} = require(`${appRoot}/ajax/controllers/territory`);

// Visits
router.post('/visit/add', unitController.addVisit);
router.post('/visit/remove', () => {
  res.send('/visit/remove NOT YET IMPLEMENTED');
});

// Subunits
// FIXME: implement controller when refactored
router.post('/subunit/add', () => {
  res.send('/subunit/add NOT YET IMPLEMENTED');
});
// FIXME: implement controller when refactored
router.post('/subunit/remove', () => {
  res.send('/subunit/remove NOT YET IMPLEMENTED');
});

// Tags
router.post('/tag/add', unitController.addTag);
// FIXME: implement controller when refactored
router.post('/tag/remove', () => {
  res.send('/tag/remove NOT YET IMPLEMENTED');
});

// Householders
router.post('/householder/add', unitController.addHouseholder);
router.post('/householder/remove', () => {
  res.send('/householder/remove NOT YET IMPLEMENTED');
});

// Notes
router.post('/note/add', unitController.addNote);
router.post('/note/remove', () => {
  res.send('/note/remove NOT YET IMPLEMENTED');
});

// Metadata
// router.get('/meta', unitController.meta);
router.post('/meta', unitController.setMeta);

module.exports = router;
