/**
 * User Collection seed data
 */
const {ObjectId} = require('mongodb');

var congregation1 = {
  "name" : "North Test",
  "circuit" : "PA-16",
  "language" : "en",
  "territory" : new ObjectId(),
  "admin" : new ObjectId()
}

module.exports = [congregation1];
