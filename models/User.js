const mongoose = require('./db'), Schema = mongoose.Schema;

var User = mongoose.model('User', new Schema({
  name: String
}));

module.exports = User;
