const {ObjectId} = require('mongodb');

exports.valid = {
 first_name: 'Julian',
 last_name: 'Hernandez',
 email: 'hernandez.julian17@gmail.com',
 email_confirm: 'hernandez.julian17@gmail.com',
 phone_number: '(215)400-0468',
 congregation_number: 99499,
 title: 'Ministerial Servant',
 password: 'newpasssword',
 password_confirm: 'newpasssword',
 congregation: new ObjectId()
};

exports.passwordUnmatched = {
 first_name: 'Julian',
 last_name: 'Hernandez',
 email: 'hernandez.julian17@gmail.com',
 email_confirm: 'hernandez.julian17@gmail.com',
 phone_number: '(215)400-0468',
 congregation_number: 99499,
 title: 'Ministerial Servant',
 password: 'newpasssword',
 password_confirm: 'different',
 congregation: new ObjectId()
};

exports.decimalCongregationNumber = {
 first_name: 'Julian',
 last_name: 'Hernandez',
 email: 'hernandez.julian17@gmail.com',
 email_confirm: 'hernandez.julian17@gmail.com',
 phone_number: '(215)400-0468',
 congregation_number: 994.99,
 title: 'Ministerial Servant',
 password: 'newpasssword',
 password_confirm: 'newpasssword',
 congregation: new ObjectId()
};
