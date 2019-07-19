/**
 * AJAX Block router
 */

const express = require('express');
const router = express.Router({mergeParams: true});
const appRoot = require('app-root-path');

const {logger} = require(`${appRoot}/utils`);
const {blockController} = require(`${appRoot}/ajax/controllers/territory`);

// add / remove tags
router.post('/tag/add', blockController.addTag);
router.post('/tag/remove', blockController.removeTag);

// add worked record
router.post('/worked', blockController.markWorked);

module.exports = router;
