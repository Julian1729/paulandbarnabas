/**
 * Seed data to save to batabase
 * @type {Object}
 */
 var completeUser, validUser;
  completeUser = validUser = {
  first_name: 'Julian',
  last_name: 'Hernandez',
  email: 'hernandez.julian17@gmail.com',
  email_confirm: 'hernandez.julian17@gmail.com',
  phone_number: '(215)400-0468',
  title: 'Ministerial Servant',
  password: 'newpasssword',
  password_confirm: 'newpasssword'
};

var incompleteUser = {
  email: 'hernandez.julian17@gmail.com',
  title: 'Ministerial Servant',
  password: 'newpasssword',
  password_confirm: 'newpasssword'
};

var passwordUnmatched = {
  first_name: 'Julian',
  last_name: 'Hernandez',
  email: 'hernandez.julian17@gmail.com',
  title: 'Ministerial Servant',
  password: 'newpasssword',
  password_confirm: 'different'
};

module.exports = {
  completeUser,
  validUser,
  incompleteUser,
  passwordUnmatched
}
