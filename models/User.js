var
  mongoose = require('./db'),
  Schema = mongoose.Schema,
  uniqueValidator = require('mongoose-unique-validator'),
  config = require('../config/config')(),
  bcrypt = require('bcrypt'),
  Utils = require('../Utils/Utils'),
  logger = require('../utils/logger'),
  _ = require('lodash');

/**
 * Schema for holding a user's assignments such as Territory fragments
 * @type {Schema}
 */
var assignmentsSchema = new Schema({
  fragments: [{
    type: Schema.ObjectId,
    // FIXME: reference the fragments of corresponding territory
  }]
});


var UserSchema = new Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    // OPTIMIZE: Regex validate email string
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  email_confirm: {
    type: String,
    required: true,
    trim: true,
  },
  phone_number: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  title: String,
  // OPTIMIZE: Implement congregation reference
  // should hold ObjectIds that reference a congregation in the "Congregations" collection
    // host: {
    //   type: Schema.ObjectId,
    //   ref: 'Congregation'
    // }
  // OPTIMIZE: Implement assignmentsSchema
});

/**
 * Plugins
 */
// add unique validation plugin
UserSchema.plugin(uniqueValidator);


/**
 * Pre Middleware
 */
UserSchema.pre('save', function(next){

  var user = this;

  //do not hash password if it hasnt been changed
  if(!user.isModified('password')) {
    return next();
  }

  Utils.bcryptPassword(user.password)
  .then(function(hashedPassword) {
      user.password = hashedPassword;
      next();
  })
  .catch(function(err){
    // set password to null if it could not be hashed
    user.password = null;
    return next(err);
  });

  // bcrypt.hash(user.password, config.bcrypt.salt_rounds)
  // .then(function(hashedPassword) {
  //     user.password = hashedPassword;
  //     next();
  // })
  // .catch(function(err){
  //   // set password to null if it could not be hashed
  //   user.password = null;
  //   return next(err);
  // });

});

/**
 * Methods
 */

 /**
  * Authenticate a user by checking passed in password or User object
  * @param  {[Object or String]} password
  * @return {[type]}
  */
  UserSchema.methods.authenticate = function(suspectedPassword){

    var password = null;
    if( _.isString(suspectedPassword) ){
      password = suspectedPassword;
    }else if (typeof suspectedPassword === 'object' && suspectedPassword.password) {
      password = suspectedPassword.password;
    }

    // hash password
    return bcrypt.compare(suspectedPassword, this.password);

  };

/**
 * Export
 */
var User = mongoose.model('User', UserSchema);

module.exports = User;
