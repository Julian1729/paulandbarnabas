/**
 * Session
 */

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

module.exports = {
  validate: SessionValidator,
  createSession
};
