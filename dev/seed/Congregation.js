/**
 * User Collection seed data
 */
const {ObjectId} = require('mongodb');

var congregation1 = {
  "name" : "North Test",
  "circuit" : "PA-16",
  "language" : "en",
  "territory" : new ObjectId("5c65dc6c433e9808a8b0e466"),
  "admin" : new ObjectId()
}

module.exports = [congregation1];
