/**
 * Session
 */
const _ = require('lodash');

const SessionValidator = require('../validators/SessionValidator');
const {SessionUninitialized, SessionUnauthenticated} = require('../errors');
const logger = require('../utils/logger');

var createSession = (req, obj) => {
  var validate = SessionValidator(obj);
  if(validate){
    throw new SessionUninitialized();
  }
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      req.session[key] = obj[key];
    }
  }
};

/**
 * Pick out the user user credentials from the session obj
 * @param  {Object} req Session object
 * @return {Object} User creadentials
 */
var pickUserCredentials = (session) => {
  return _.pick(session, [
    'first_name',
    'last_name',
    'isAdmin',
    'congregation',
    'user_id'
  ]);
};

module.exports = {
  validate: SessionValidator,
  createSession,
  pickUserCredentials
};
