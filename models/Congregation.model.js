const mongoose = require('./db');
const Schema = mongoose.Schema;

var CongregationSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  circuit: {
    type: String,
  },
  language: {
    type: String,
    required: true
  },
  territory: {
    type: Schema.Types.ObjectId,
    ref: 'Territory',
    required: true
  },
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

/**
 * Plugins
 */


/**
 * Methods
 */


/**
 * Export
 */
var Congregation = mongoose.model('Congregation', CongregationSchema);

module.exports = Congregation;
