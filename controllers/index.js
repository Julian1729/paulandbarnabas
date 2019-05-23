/**
 * Controller Index
 */

const adminPanelController = require('./admin-panel.controller');

const createAccountController = require('./create-account.controller');

const dashboardController = require('./dashboard.controller');

const fragmentController = require('./fragment.controller');

const loginController = require('./login.controller');

const territoryController = require('./territory.controller');

const unitController = require('./unit.controller');

module.exports = {
  adminPanelController,
  createAccountController,
  dashboardController,
  fragmentController,
  loginController,
  territoryController,
  unitController,
};
