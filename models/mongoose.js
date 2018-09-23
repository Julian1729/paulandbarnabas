const mongoose = require('mongoose');

// Add Promise functionality
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/PaulAndBarnabas');

module.exports = mongoose;
