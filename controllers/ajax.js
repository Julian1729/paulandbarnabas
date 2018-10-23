// OPTIMIZE: Split all controllers into individual files and load file from router
// based on their name
const _ = require('lodash');
const HttpStatus = require('http-status-codes');

const SignUpValidator = require('../validators/SignUpValidator');
const LoginValidator = require('../validators/LoginValidator');
const config = require('../config/config')();
const UserModel = require('../models/User');
const logger = require('../utils/logger');
const controllerBase = require('./base');
const Utils = require('../utils/utils');
const {UserNotFound, FormValidationError, InvalidCredentials} = require('../errors.js');

/**
 * Send back a standard JSON response to an ajax request
 * @param  {[Object]} res Express response object to be able to execute response
 * @param  {[Object]} options Object used to pass in options {status: (http status code, default 200), message: {String}, data: null | object, validation: validation errors obj}
 * @param  {[Number]} httpStatus HTTP status code
 * @return {[void]}
 */
var ajaxResponse = (res, options, httpStatus) => {

  var responseBase = {
    status: HttpStatus.OK,
    data: null,
    error: null
  };

  var response = _.extend({}, responseBase, options);

  if(httpStatus){
    res.status(httpStatus).json(response);
  }else{
    res.json(response);
  }

  return;

};

var login = controllerBase.extend({
  name: 'login',
  run: function(req, res, next){

    // collect data
    var loginData = Utils.collectFormData([
      'email',
      'password'
    ], req);

    // validate input
    var validation = LoginValidator(loginData);
    if(validation){
      // validation failed, respond with error
      return ajaxResponse(res, {
        error: new FormValidationError(validation)
      });
    }

    // find user in database
    UserModel.findOne({email: loginData.email})
      .then(user => {
        if(!user){
          throw new UserNotFound(`Unable to find user with info: ${JSON.stringify(loginData)}`);
        }
        logger.debug(`User found by email. User: ${user}`);
        return user;
      })
      .then(user => {
        // authenticate user
        return user.authenticate(loginData.password)
          .then( result => {
            // user unable to be authenticated
            if(!result){
              throw new InvalidCredentials();
            }
            return user;
          })
          .catch(e => Promise.reject(e));
      })
      .then( user => {
        logger.info(user);

        // USER AUTHENTICATED
        // set session params
        req.session.authenticated = true;
        req.session.user = {
          id: user._id
        };
        return ajaxResponse(res, {
          data:{
            redirect: '/dashboard'
          }
        });
      })
      .catch(e => {


        if(e instanceof UserNotFound || e instanceof InvalidCredentials){
          logger.debug(e.name + '\n' + JSON.stringify(e));
          return ajaxResponse(res, {
            error: e
          });
        }else{
          // if cannot discern specific error type, log error and return HTTP 500
          logger.debug(`Login controller failed. Error: ${e.message} \n ${e.stack}`);
          return ajaxResponse(res, {
            status: HttpStatus.INTERNAL_SERVER_ERROR
          });
        }

      });

  }
})

var signUp = controllerBase.extend({
  name: 'sign-up',
  run: function(req, res, next){

    var signUpData = Utils.collectFormData([
      'first_name',
      'last_name',
      'email',
      'email_confirm',
      'phone_number',
      'password',
      'password_confirm'
    ], req);

    SignUpValidator(signUpData)
      .then( () => {
        var User = new UserModel(signUpData);
        User.save()
          .then((newUser) => {
            // set authenticated session, and store user id
            req.session.authenticated = true;
            req.session.user = {
              id: newUser._ids
            };

            // send ajax response
            return ajaxResponse(res, {
              data: {
                redirect: `${config.base_url}/dashboard`
              }
            });
          })
          .catch(e => {
            logger.log(`Error in saving user \n${e}`);
            return ajaxResponse(res, {
              status: HttpStatus.INTERNAL_SERVER_ERROR
            });
          });
      })
      .catch((validationErrors) => {
        // FIXME: use validation error
        logger.debug('catch ran');
        return ajaxResponse(res, {
          error: new FormValidationError(validationErrors)
        });
      });

  }
});

module.exports = {
  'sign-up': signUp,
  'login': login
};
