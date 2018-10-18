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
    message: null,
    data: null,
    validation: null
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

    // validate input
    var loginData = Utils.collectFormData([
      'email',
      'password'
    ], req);
    var validation = LoginValidator(loginData);
    if(validation){
      return ajaxResponse(res, {
        validation: validation
      });
    }
    // find user in database
    //var user = null;
    UserModel.findOne({email: loginData.email})
      .then(user => {
        if(!user){
          logger.debug(`No user found with login credentials. User: ${user}`)
          ajaxResponse(res, {
            message: 'Invalid credentials'
          });
          return Promise.reject('custom error message');
        }
        logger.debug(`User found by email. User: ${user}`);
        return user.authenticate(loginData.password);
      })
      .then(result => {
        // authenticate user
        if(!result){
          return ajaxResponse(res, {
            message: 'Invalid credentials'
          });
        }

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
        logger.error(`Login controller failed: ${e}`);
        return ajaxResponse(res, {
          status: 0
        })
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
      'password',
      'password_confirm'
    ], req);

    UserValidator(signUpData)
      .catch((validationErrors) => {
        ajaxResponse(res, {
          validation: validationErrors
        });
      });

    var User = new UserModel(signUpData);
    User.save()
      .then((newUser) => {
        // set authenticated session, and store user id
        req.session.authenticated = true;
        req.session.user = {
          id: newUser._id
        };

        // send ajax response
        ajaxResponse(res, {
          data: {
            redirect: `${config.base_url}/dashboard`
          }
        });
      })
      .catch((e) => {
        ajaxResponse(res, {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Unable to save user to database, ${e}`
        });
      });

  }
});

module.exports = {
  'sign-up': signUp,
  'login': login
};
