const appRoot = require('app-root-path');
var HttpStatus = require('http-status-codes');

var errors = require(`${appRoot}/errors`);
var {logger} = require(`${appRoot}/utils`);
var seedData = require(`${appRoot}/dev/seed/data`);
var Session = require(`${appRoot}/session/session`);

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
        logger.debug('Sessioned Authorized w/ development credentials');
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
  let userCreds = Session.pickUserCredentials(req.session);
  res.locals.user = userCreds;
  req.app.locals.user = userCreds;
  next();
};

module.exports = [
  authenticate,
  localizeSession
];
