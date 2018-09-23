const mongoose = require('./mongoose'), Schema = mongoose.Schema;

var User = mongoose.model('User', new Schema({
  name: String
}));

module.exports = User;
