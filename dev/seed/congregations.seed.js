/**
 * User Collection seed data
 */
const {ObjectId} = require('mongodb');

let congregation1 = {
  name : "North Test",
  circuit : "PA-16",
  language : "en",
  city: 'Philadelphia',
  country: 'USA',
  number : 99499,
  territory : new ObjectId(),
  admin : new ObjectId()
}

module.exports = [congregation1];
