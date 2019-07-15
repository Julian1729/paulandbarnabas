const express = require('express');
const router = express.Router({mergeParams: true});
const appRoot = require('app-root-path');

const {authenticationMiddleware} = require(`${appRoot}/middleware`);
const {usersController} = require(`${appRoot}/ajax/controllers`);

router.use([authenticationMiddleware.devSessionAdmin, authenticationMiddleware.ajaxSession, authenticationMiddleware.ajaxAdmin]);

/**
 * Get list of users attached
 * to congregation.
 */
router.get('/list', usersController.list);

module.exports = router;
