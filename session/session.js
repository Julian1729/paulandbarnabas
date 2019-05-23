/**
 * Session
 */
const _ = require('lodash');
const appRoot = require('app-root-path');

const {sessionValidator} = require(`${appRoot}/utils/validators`);
const {SessionUninitialized, SessionUnauthenticated} = require(`${appRoot}/errors`);

var createSession = (req, obj) => {
  var validate = sessionValidator(obj);
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
  validate: sessionValidator,
  createSession,
  pickUserCredentials
};
