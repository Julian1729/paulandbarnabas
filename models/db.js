const mongoose = require('mongoose');

// Add Promise functionality
mongoose.Promise = global.Promise;

mongoose.set('useCreateIndex', true)

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

module.exports = mongoose;
