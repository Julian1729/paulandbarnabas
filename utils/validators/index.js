/**
 * Validators
 */
const createFragmentValidator = require('./create-fragment.validator');

const createTerritoryValidator = require('./create-territory.validator');

const loginValidator = require('./login.validator');

const sessionValidator = require('./session.validator');

const signupValidator = require('./signup.validator');

module.exports = {
  createFragmentValidator,
  createTerritoryValidator,
  loginValidator,
  sessionValidator,
  signupValidator,
};
