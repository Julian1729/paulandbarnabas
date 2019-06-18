/**
 * Session Seed Data
 */
const {ObjectId} = require('mongodb');

exports.valid = {
  first_name: 'Julian',
  last_name: 'Hernandez',
  isAdmin: false,
  congregation: new ObjectId(),
  user_id: new ObjectId(),
  authenticated: true
};

exports.admin = {
  first_name: 'Julian',
  last_name: 'Hernandez',
  isAdmin: true,
  congregation: new ObjectId(),
  user_id: new ObjectId(),
  authenticated: true
};

exports.invalid = {
  first_name: 'Julian',
  last_name: 'Hernandez',
  isAdmin: false,
  congregation: new ObjectId(),
  user_id: new ObjectId(),
  authenticated: false
};
