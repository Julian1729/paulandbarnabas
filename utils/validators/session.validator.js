/**
 * Validate a Session object from req.session
 */

const {SessionUninitialized, SessionUnauthenticated} = require('../errors');
const validate  = require('./base');

const required = {
  presence: {
    allowEmpty: false
  }
}

var SessionConstraints = {
  first_name: {
    presence: {
      allowEmpty: false
    }
  },
  last_name: {
    presence: {
      allowEmpty: false
    }
  },
  isAdmin: {
    presence: {
      allowEmpty: false
    }
  },
  congregation: {
    presence: {
      allowEmpty: false
    }
  },
  user_id: {
    presence: {
      allowEmpty: false
    }
  },
  authenticated: {
    presence: {
      allowEmpty: false
    }
  }
};

const v = session => {
  var results = validate(session, SessionConstraints);
  if(results){
    throw new SessionUninitialized();
  }
  if(session.authenticated === false){
    throw new SessionUnauthenticated();
  }
  return results;
}

module.exports = v;
