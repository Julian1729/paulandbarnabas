/**
 * User Collection seed data
 */
const {ObjectId} = require('mongodb');

var user1 = {
  first_name: 'Julian',
  last_name: 'Hernandez',
  email: 'hernandez.julian17@gmail.com',
  phone_number: '2154000468',
  title: 'Ministerial Servant',
  password: 'julianspassword',
  congregation: null
};

var user2 = {
  first_name: 'Todd',
  last_name: 'Roberson',
  email: 'toddy@gmail.com',
  phone_number: '2673334444',
  title: 'Ministerial Servant',
  password: 'toddspassword',
  congregation: null
};

module.exports = [user1, user2];
