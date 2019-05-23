/**
 * Block Ajax Router
 */

const express = require('express');
const router = express.Router({mergeParams: true});
const HttpStatus = require('http-status-codes');
const appRoot = require('app-root-path');

const {blockController} = require(`${appRoot}/controllers/ajax/territory/index`);
const logger = require(`${appRoot}/utils/logger`);

/**
 * Middleware
 */
router.use(blockController.middleware.findBlock);

/**
 * Endpoints
 */

// add / remove tags
router.post('/tag/add', blockController.endpoints.addTag);
router.post('/tag/remove', blockController.endpoints.removeTag);

// add worked record
router.post('/worked', blockController.endpoints.addWorkedRecord);

module.exports = router;
