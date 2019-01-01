const path = require('path');
const http = require('http');
const yargs = require('yargs');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const publicPath = path.join(__dirname, '/public');
const config = require('./config/config');
const constants = require('./config/constants');

/**
 * Parse command line arguemnts with yargs
 */
yargs
  .option('seed', {
    alias: 's',
    describe: 'Wipe and seed database with data defined in dev/seed'
  })
  .help();
// Arguments
var argv = yargs.argv;

/**
 * Create HTTP Server and Express
 */
var app = express();
var server = http.createServer(app);

/**
 * Pug and View Engine
 */
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

/**
 * Middleware
 */
// Static Server
 app.use(express.static(__dirname + '/public'))
 // Body Parser
 app.use(bodyParser.urlencoded({extended: false}));
 app.use(bodyParser.json());
 // FIXME: Make session secret an env var
 // Session
 app.use(session({secret: 'julianiscool', saveUninitialized: false, resave: false}));
 // Add constants and config vars to all render params
 app.use((req, res, next) => {
   res.locals.constants = constants;
   next();
 });
 // // Express json
 // app.use(express.json());

/**
 * Express Routing
 */
 // Landing page (Login Page)
 app.use('/', require('./routes/Login') );

 // AJAX Requests
 app.use('/ajax', require('./routes/ajax'));

 // Sign Up
 app.use('/createaccount', require('./routes/CreateAccount'));

 // Dashboard
 app.use('/dashboard', require('./routes/Dashboard'));

 // Admin Panel
 app.use('/adminpanel', require('./routes/AdminPanel'));

 // Seed database if in development
 if(process.env.NODE_ENV === 'development'){
  var seed = (argv.seed || argv._[0] === 'seed');
  require('./dev/seed/populate')(seed);
}


// Start express server
server.listen(process.env.PORT, ()=>{
  console.log(`"${constants.site_name}" live on port ${process.env.PORT}`);
});

module.exports = {app};
