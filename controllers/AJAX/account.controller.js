/**
 * Ajax Account Controller
 *
 * Gateway to all modifications done to any user account
 */
const appRoot = require('app-root-path');
const HttpStatus = require('http-status-codes');

const UserModel = require(`${appRoot}/models`);
const Session = require(`${appRoot}/session/session`);
const {logger, helpers} = require(`${appRoot}/utils`);
const constants = require(`${appRoot}/config/constants`);
const {loginValidator, signupValidator} = require(`${appRoot}/utils/validators`);
const {FormValidationError, InvalidCredentials, SessionUninitialized} = require(`${appRoot}/errors.js`);


/**
 * Actions
 */

 /**
  * User Signup Action
  */
  var signUp = (req, res, next) => {

    var signUpData = helpers.collectFormData([
      'first_name',
      'last_name',
      'email',
      'email_confirm',
      'phone_number',
      'password',
      'password_confirm'
    ], req);

    signupValidator(signUpData)
      .then( () => {
        var User = new UserModel(signUpData);
        User.save()
          .then((newUser) => {
            Session.createSession(req, {
              first_name: newUser.first_name,
              last_name: newUser.last_name,
              isAdmin: false,
              congregation: dev.congregationId,
              user_id: newUser._id,
              authenticated: true
            });

            // send ajax response
            return helpers.ajaxResponse(res, {
              data: {
                redirect: `${constants.base_url}/dashboard`
              }
            });
          })
          .catch(e => {
            logger.log(`Error in saving user \n${e.stack}`);
            return helpers.ajaxResponse(res, {
              status: HttpStatus.INTERNAL_SERVER_ERROR
            });
          });
      })
      .catch((validationErrors) => {
        return helpers.ajaxResponse(res, {
          error: new FormValidationError(validationErrors)
        });
      });

    };

  /**
   * User Login Action
   */
  var login = (req, res, next) => {

    // collect data
    var loginData = helpers.collectFormData([
      'email',
      'password'
    ], req);

    // validate input
    var validation = loginValidator(loginData);
    if(validation){
      // validation failed, respond with error
      return helpers.ajaxResponse(res, {
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
        logger.debug(`User found by email. User: ${user.first_name} ${user.last_name} (${user.email})`);
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

        // USER AUTHENTICATED
        Session.createSession(req, {
          first_name: user.first_name,
          last_name: user.last_name,
          user_id: user._id,
          congregation: user.congregation,
          authenticated: true,
          isAdmin: false
        });

        return helpers.ajaxResponse(res, {
          data:{
            redirect: '/dashboard'
          }
        });
      })
      .catch(e => {

        if(e instanceof InvalidCredentials || e instanceof SessionUninitialized){
          logger.debug(e.name + '\n' + JSON.stringify(e));
          return helpers.ajaxResponse(res, {
            error: e
          });
        }else{
          // if cannot discern specific error type, log error and return HTTP 500
          logger.debug(`Login controller failed. Error: ${e.message} \n ${e.stack}`);
          console.log(e.stack);
          return helpers.ajaxResponse(res, {
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
