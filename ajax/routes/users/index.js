const express = require('express');
const router = express.Router({mergeParams: true});
const appRoot = require('app-root-path');

const {usersController} = require(`${appRoot}/ajax/controllers`);

/**
 * Get list of users attached
 * to congregation.
 * // FIXME: authenticate as admin
 */
router.get('/list', usersController.list);

module.exports = router;
