const {ObjectId} = require('mongodb')

exports.validCongregation = {
  name: 'Roosevelt',
  circuit: 'PA-16',
  number: 99499,
  country: 'USA',
  city: 'Philadelphia',
  language: 'en',
  territory: new ObjectId(),
  admin: new ObjectId()
};

exports.invalidCongregation = {
  name: '',
  circuit: 'PA-16',
  language: 'en',
  number: 99499,
  territory: new ObjectId(),
  admin: new ObjectId()
};
