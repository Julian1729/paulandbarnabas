var Session = require('../../session/session');
var errors = require('../../errors');
var HttpStatus = require('http-status-codes');
var seedData = require('../../dev/seed/data');
var logger = require('../../utils/logger');

var authenticate = (req, res, next) => {

  var session = req.session;
  try {
    Session.validate(session)
    logger.debug('Session Authorized');
    return next();
  } catch (e) {
    if(e instanceof errors.SessionUninitialized || e instanceof errors.SessionUnauthenticated){
      logger.debug('Sesssion Unauthorized');
      // if in dev mode...pass error to next to be caught by createDevSession
      // if(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'testing'){
      if(process.env.NODE_ENV === 'development'){
        logger.debug('Creating test session...')
        Session.createSession(req, seedData.sessions.admin);
        Session.validate(session);
        // console.log('session from middlware', session);
        return next();
      }
      return res.redirect('/');
    }
  }

};

/**
 * Attach session variables to req.locals
 * to make available to pug templates
 */
var localizeSession =  (req, res, next) => {
  res.locals.user = Session.pickUserCredentials(req.session);
  next();
};

module.exports = [
  authenticate,
  localizeSession
];
