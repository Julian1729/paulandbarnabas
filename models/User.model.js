const _ = require('lodash');
const bcrypt = require('bcrypt');
const appRoot = require('app-root-path');
const uniqueValidator = require('mongoose-unique-validator');

const mongoose = require('./db');
const Schema = mongoose.Schema;
const {helpers} = require(`${appRoot}/utils`);

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
  phone_number: {
    // OPTIMIZE: Regex validate phone number
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  title: String,
  congregation: {
    type: Schema.ObjectId,
    ref: 'Congregation'
  }
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

  helpers.bcryptPassword(user.password)
  .then(function(hashedPassword) {
      user.password = hashedPassword;
      next();
  })
  .catch(function(err){
    // set password to null if it could not be hashed
    user.password = null;
    return next(err);
  });

});

/**
 * Statics
 */
UserSchema.statics.getUsersByCongregation = function(congregation){

  return this.find({congregation: congregation}, 'first_name last_name id');

};

UserSchema.statics.findByID = function(congregation, id){

  return this.findOne({congregation: congregation, _id: id});

};

/**
 * Export
 */
var User = mongoose.model('User', UserSchema);

module.exports = User;
