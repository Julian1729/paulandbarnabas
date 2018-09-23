const mongoose = require('mongoose');

const config = require('../config/config')();

// Add Promise functionality
mongoose.Promise = global.Promise;

mongoose.connect(`mongodb://${config.mongo.url}:${config.mongo.port}/${config.mongo.db_name}`, { useNewUrlParser: true });

module.exports = mongoose;
