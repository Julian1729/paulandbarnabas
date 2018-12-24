/**
 * Seed data to save to batabase
 * @type {Object}
 */

const {ObjectId} = require('mongodb');

 var completeUser, validUser;
  completeUser = validUser = {
  first_name: 'Julian',
  last_name: 'Hernandez',
  email: 'hernandez.julian17@gmail.com',
  email_confirm: 'hernandez.julian17@gmail.com',
  phone_number: '(215)400-0468',
  title: 'Ministerial Servant',
  password: 'newpasssword',
  password_confirm: 'newpasssword',
  congregation: new ObjectId()
};

var incompleteUser = {
  email: 'hernandez.julian17@gmail.com',
  title: 'Ministerial Servant',
  password: 'newpasssword',
  password_confirm: 'newpasssword',
  congregation: new ObjectId()
};

var passwordUnmatched = {
  first_name: 'Julian',
  last_name: 'Hernandez',
  email: 'hernandez.julian17@gmail.com',
  title: 'Ministerial Servant',
  password: 'newpasssword',
  password_confirm: 'different',
  congregation: new ObjectId()
};

module.exports = {
  completeUser,
  validUser,
  incompleteUser,
  passwordUnmatched
}
