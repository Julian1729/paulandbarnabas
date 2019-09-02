const mongoose = require('./db');
const Schema = mongoose.Schema;

var CongregationSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  circuit: {
    type: String,
    uppercase: true,
  },
  language: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  number: {
    type: Number,
    required: true,
    unique: true,
  },
  territory: {
    type: Schema.Types.ObjectId,
    ref: 'Territory',
    required: true,
  },
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  referall: {
    type: String,
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
