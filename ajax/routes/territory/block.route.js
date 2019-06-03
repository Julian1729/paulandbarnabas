/**
 * AJAX Block router
 */

const express = require('express');
const router = express.Router({mergeParams: true});
const appRoot = require('app-root-path');

const {logger} = require(`${appRoot}/utils`);

// add / remove tags
router.post('/tag/add', () => {
  res.send('/tag/add')
});
router.post('/tag/remove', () => {
  res.send('/tag/remove');
});

// add worked record
router.post('/worked', () => {
  res.send('/worked');
});

module.exports = router;
