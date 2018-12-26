/**
 * Ajax Account Controller
 *
 * Gateway to all modifications done to any user account
 */
const HttpStatus = require('http-status-codes');

const {FormValidationError, InvalidCredentials, SessionUninitialized} = require('../../errors.js');
const SignUpValidator = require('../../validators/SignUpValidator');
const LoginValidator = require('../../validators/LoginValidator');
const UserModel = require('../../models/User');
const Session = require('../../session/session');
const logger = require('../../utils/logger');
const {ajaxResponse} = require('./Base');
const Utils = require('../../utils/utils');


/**
 * Actions
 */

 /**
  * User Signup Action
  */
  var signUp = (req, res, next) => {

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

    };

  /**
   * User Login Action
   */
  var login = (req, res, next) => {

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
          logger.debug(`Unable to find user with info: ${JSON.stringify(loginData)}`);
          throw new InvalidCredentials();
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
        logger.debug(user._id);

        // USER AUTHENTICATED
        Session.createSession(req, {
          first_name: user.first_name,
          last_name: user.last_name,
          user_id: user._id,
          congregation: user.congregation,
          authenticated: true,
          isAdmin: false
        });

        return ajaxResponse(res, {
          data:{
            redirect: '/dashboard'
          }
        });
      })
      .catch(e => {

        if(e instanceof InvalidCredentials || e instanceof SessionUninitialized){
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

  };

/**
 * Export Actions
 */
module.exports = {
  signUp,
  login
};
