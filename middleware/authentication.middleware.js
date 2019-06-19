const appRoot = require('app-root-path');
let HttpStatus = require('http-status-codes');

let errors = require(`${appRoot}/errors`);
let {logger, Session, AjaxResponse} = require(`${appRoot}/utils`);
let seedData = require(`${appRoot}/dev/seed/data`);

exports.session = (req, res, next) => {

  let session = new Session(req);
  try {
    let missing = session.validate();
    if(!session.isAuthenticated()){
      throw new errors.SessionUnauthenticated();
    }
  } catch (e) {
    if(e instanceof errors.SessionUninitialized || e instanceof errors.SessionUnauthenticated){
      return res.redirect('/');
    }
    next(e);
  }

  next();

};

exports.ajaxSession = (req, res, next) => {

  let session = new Session(req);
  try {
    let missing = session.validate();
    if(!session.isAuthenticated()){
      throw new errors.SessionUnauthenticated();
    }
  } catch (e) {
    if(e instanceof errors.SessionUninitialized || e instanceof errors.SessionUnauthenticated){
      return res.status(HttpStatus.UNAUTHORIZED).send();
    }
    next(e);
  }

  next();

};

exports.ajaxAdmin = (req, res, next) => {

  let session = new Session(req);
  if(!session.isAdmin()){
    return res.status(HttpStatus.FORBIDDEN).send();
  }
  return next();

};

exports.admin = (req, res, next) => {

  let session = new Session(req);
  if(!session.isAdmin()){
    return res.redirect('/');
  }
  next();

};

// exports.authenticate = (req, res, next) => {
//
//   var session = req.session;
//   try {
//     Session.validate(session)
//     logger.debug('Session Authorized');
//     return next();
//   } catch (e) {
//     if(e instanceof errors.SessionUninitialized || e instanceof errors.SessionUnauthenticated){
//       logger.debug('Sesssion Unauthorized');
//       // if in dev mode...pass error to next to be caught by createDevSession
//       // if(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'testing'){
//       if(process.env.NODE_ENV === 'development'){
//         logger.debug('Creating test session...')
//         Session.createSession(req, seedData.sessions.admin);
//         Session.validate(session);
//         logger.debug('Session Authorized w/ development credentials');
//         // console.log('session from middlware', session);
//         return next();
//       }
//       return res.redirect('/');
//     }
//   }
//
// };

/**
 * Attach session variables to req.locals
 * to make available to pug templates
 */
exports.localizeSession =  (req, res, next) => {
  let userCreds = Session.pickUserCredentials(req.session);
  res.locals.user = userCreds;
  req.app.locals.user = userCreds;
  next();
};
