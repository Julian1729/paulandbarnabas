var
  mongoose = require('./db'),
  Schema = mongoose.Schema,
  uniqueValidator = require('mongoose-unique-validator'),
  config = require('../config/config')(),
  bcrypt = require('bcrypt');

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


var userSchema = new Schema({
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

// add unique validation plugin
userSchema.plugin(uniqueValidator);

userSchema.pre('save', function(next){

  var user = this;

  //do not hash password if it hasnt been changed
  if(!user.isModified('password')) {
    return next();
  }

  bcrypt.hash(user.password, config.bcrypt.salt_rounds)
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

var User = mongoose.model('User', userSchema);

module.exports = User;
