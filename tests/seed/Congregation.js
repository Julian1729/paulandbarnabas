const {ObjectId} = require('mongodb')

const validCongregation = {
  name: 'Roosevelt',
  circuit: 'PA-16',
  language: 'en',
  territory: new ObjectId(),
  admin: new ObjectId()
};

const invalidCongregation = {
  name: '',
  circuit: 'PA-16',
  language: 'en',
  territory: new ObjectId(),
  admin: new ObjectId()
};


module.exports = {
  validCongregation,
  invalidCongregation
};
