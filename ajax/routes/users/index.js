const express = require('express');
const router = express.Router({mergeParams: true});
const appRoot = require('app-root-path');

const {authentication} = require(`${appRoot}/middleware`);
const {usersController} = require(`${appRoot}/ajax/controllers`);

router.use(authentication.admin);

/**
 * Get list of users attached
 * to congregation.
 */
router.get('/list', usersController.list);

module.exports = router;
