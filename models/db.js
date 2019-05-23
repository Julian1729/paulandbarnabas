const appRoot = require('app-root-path');

const mongoose = require('mongoose');
const config = require(`${appRoot}/config/config`);

// Add Promise functionality
mongoose.Promise = global.Promise;

mongoose.set('useCreateIndex', true)

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

module.exports = mongoose;
