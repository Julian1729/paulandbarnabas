/**
 * Ajax Account Controller
 *
 * Gateway to all modifications done to any user account
 */
const appRoot = require('app-root-path');
const HttpStatus = require('http-status-codes');

const UserModel = require(`${appRoot}/models`);
const {logger, helpers, Session} = require(`${appRoot}/utils`);
const {accountServices} = require(`${appRoot}/services`);
const constants = require(`${appRoot}/config/constants`);
const {loginValidator, signupValidator} = require(`${appRoot}/utils/validators`);
const {FormValidationError, InvalidCredentials, SessionUninitialized} = require(`${appRoot}/errors.js`);

exports.signUp = (req, res, next) => {

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

exports.login = async (req, res, next) => {

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

    let user = null;
    try {
      user = await accountServices.authenticateUserCredentials(loginData.email, loginData.password);
    } catch (e) {
      if(e instanceof InvalidCredentials){
        console.log(e);
        return helpers.ajaxResponse(res, {
          error: 'InvalidCredentials'
        })
      }
    }

    // user authenticated, create session
    let session = new Session(req);
    session.create(user);

    return helpers.ajaxResponse(res, {
      data:{
        redirect: '/dashboard'
      }
    });


  };
