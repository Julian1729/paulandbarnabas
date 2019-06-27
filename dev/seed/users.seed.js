/**
 * User seed data
 */
const {ObjectId} = require('mongodb');

// this must be the first user
// in the array because its credentials
// are pulled by its index (0)
let user1 = {
  first_name: 'Julian',
  last_name: 'Hernandez',
  email: 'hernandez.julian17@gmail.com',
  phone_number: '2154000468',
  title: 'Ministerial Servant',
  password: 'julianspassword',
  congregation: new ObjectId()
};

let user2 = {
  first_name: 'Todd',
  last_name: 'Roberson',
  email: 'toddy@gmail.com',
  phone_number: '2673334444',
  title: 'Ministerial Servant',
  password: 'toddspassword',
  congregation: new ObjectId()
};

let user3 = {
  first_name: 'Julio',
  last_name: 'Hernandez',
  email: 'hernandez.julio212@gmail.com',
  phone_number: '2156296208',
  title: 'Elder',
  password: 'juliospassword',
  congregation: new ObjectId()
};

module.exports = [user1, user2, user3];
