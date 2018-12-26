/**
 * Session Seed Data
 */
const {ObjectId} = require('mongodb');

const valid = {
  first_name: 'Julian',
  last_name: 'Hernandez',
  isAdmin: false,
  congregation: new ObjectId(),
  user_id: new ObjectId(),
  authenticated: true
};

const invalid = {
  first_name: 'Julian',
  last_name: 'Hernandez',
  isAdmin: false,
  congregation: new ObjectId(),
  user_id: new ObjectId(),
  authenticated: false
};

module.exports = {
  valid,
  invalid
};
