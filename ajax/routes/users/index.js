const express = require('express');
const router = express.Router({mergeParams: true});
const appRoot = require('app-root-path');

/**
 * Get list of users attached
 * to congregation.
 * // FIXME: authenticate as admin
 */
router.get('/list', () => {
  res.send('/users/list');
});
