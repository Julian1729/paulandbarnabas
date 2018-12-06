// OPTIMIZE: Split all controllers into individual files and load file from router
// based on their name
const _ = require('lodash');
const HttpStatus = require('http-status-codes');
const mongoose = require('mongoose');
const {ObjectId} = require('mongodb');

const {UserNotFound, FormValidationError, InvalidCredentials, CongregationNotFound} = require('../errors.js');
const CreateTerritoryValidator = require('../validators/CreateTerritory');
const SignUpValidator = require('../validators/SignUpValidator');
const LoginValidator = require('../validators/LoginValidator');
const constants = require('../config/constants');
const TerritoryModel = require('../models/Territory');
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


        if(e instanceof InvalidCredentials){
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

var createTerritory = controllerBase.extend({
  name: 'create-territory',
  run: function(req, res, next){

    var territoryData = Utils.collectFormData([
      'block_hundred',
      'odd_even',
      'units',
      'street',
      'new_street_name',
      'fragment_assignment',
      'fragment_unassigned'
    ], req);

    // consolidate street name
    territoryData.street_name = territoryData.street || territoryData.new_street_name;

    var validation = CreateTerritoryValidator(territoryData);

    if(validation){
      logger.debug('validation error\n' + JSON.stringify(validation, null, 2))
      return ajaxResponse(res, {
        error: new FormValidationError(validation)
      })
    }

    // FIXME: hard coded congregation object id!!
    var hardcodedID = "5c01eb89ef008c67a6f77add";
    TerritoryModel.findOne({congregation: hardcodedID})
      .then(territory => {
        if(territory){
          logger.debug('congregation territory found');
          return territory;
        }else{
          throw new CongregationNotFound(`Territory with congregation ID ${hardcodedID} not found.`)
        }
      })

      .then(territory => {
        var toReturn = {
          territory,
          street: null
        };
        // search for street name within array
        // check for street existence
        var foundStreet = null;
        for (var i = 0; i < territory.streets.length; i++) {
          var streetObj = territory.streets[i];
          if(streetObj.name === territoryData.street_name){
            foundStreet = streetObj;
            break;
          }
        }
        if(foundStreet){
          logger.debug(`${territoryData.street_name} street already exists`);
          toReturn.street = foundStreet;
          return toReturn;
        }else{
          logger.debug(`${territoryData.street_name} needs to be created`);
          // street doesn't exist...create it
          var newStreet = {
            name: territoryData.street_name
          };
          territory.streets.push(newStreet);
          return territory.save()
            .then(territory => {
              // return street
              var street = _.find(territory.streets, function(streetObj){
                return streetObj.name === newStreet.name;
              });
              if(!street) throw new Error('New street not found back in returned object from database.')
              logger.debug(`${street.name} street created`);
              return {
                territory,
                street
              };

            })
            // delegate to main catch
            .catch(e => { throw e; });
        }
      })

      .then(infoObj => {
        var streetSide = infoObj.territory.streets.id(infoObj.street._id)[territoryData.odd_even];
        var block = _.find(streetSide, function(blockObj){
          return blockObj.hundred == territoryData.block_hundred;
        });
        // if the block exists, simply go to next step (inserting units)
        // OPTIMIZE: should the user be alerted since an existing block will be overwritten
        if(block){
          logger.debug(`${block.hundred} block of ${infoObj.street.name} already exists and will be overwritten`);
          infoObj.block = block;
          return infoObj;
        }
        logger.debug(`${territoryData.block_hundred} of ${infoObj.street.name} needs to be created`);
        // block must be created
        var newBlockId = new ObjectId();
        var newBlock = {
          _id: newBlockId,
          hundred: territoryData.block_hundred
        };
        // inject new block
        streetSide.push(newBlock);
        return infoObj.territory.save()
          .then(territory => {
            var block = territory.streets.id(infoObj.street._id)[territoryData.odd_even].id(newBlockId);
            infoObj.block = block;
            logger.debug(`${infoObj.block.hundred} block of ${infoObj.street.name} created`);
            return infoObj;
          })
          .catch(e => {throw e});
      })

      // INSERT UNITS
      .then(infoObj => {
        var units = infoObj.block.units;
        var newUnitCount = 0;
        // loop through units, create base unit object, and insert into array
        territoryData.units.forEach(unitObj => {
          var unitBase = {};
          unitBase.number = unitObj.number;
          // loop through subunits if they exist
          if(unitObj.subunits){
            // create empty subunits array
            unitBase.subunits = [];
            unitObj.subunits.forEach(name => {
              // create subunit object and add to array
              var subunit = {name};
              unitBase.subunits.push(subunit);
            });
          }
          // add unit into block
          units.push(unitBase);
          newUnitCount++;
        });
        // save updated territory doc
        return infoObj.territory.save()
          .then(territory => {
            logger.debug(`${newUnitCount} units added into block on ${territoryData.odd_even} side of ${infoObj.street.name}`);
          })
          .catch(e => {throw e});
      })

      .catch(e => {
        if(e instanceof CongregationNotFound){
          return ajaxResponse(res, {
            error: e
          });
        }else{
          console.log(e);
          return ajaxResponse(res, {
            status: 500
          });
        }
      });

  }
});

module.exports = {
  'sign-up': signUp,
  'login': login,
  'create-territory': createTerritory
};
