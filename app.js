const path = require('path');
const http = require('http');
const yargs = require('yargs');
const morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const HttpStatus = require('http-status-codes');

const routes = require('./routes');
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


(async argv => {
   // Seed database if in development
   if(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'testing'){
    var seed = (argv.seed || argv._[0] === 'seed');
    await require('./dev/seed/populate')(seed);
  }
})(argv);

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
   app.locals.moment = require('moment');
   next();
 });
 // Morgan HTTP logger
 app.use(morgan('tiny'));
 // // Express json
 // app.use(express.json());

/**
 * Express Routing
 */
 // Landing page (Login Page)
 app.use('/', routes.loginRoute);

 // AJAX Requests
 // app.use('/ajax', routes.ajax );

 // Sign Up
 app.use('/createaccount', routes.createAccountRoute);

 // Dashboard
 app.use('/dashboard', routes.dashboardRoute);

 // Admin Panel
 app.use('/adminpanel', routes.adminPanelRoute);

 // User Territory CRUD
 app.use('/territory', routes.territoryRoute);

 // Error Handler
 app.use((err, req, res, next) => {

   console.error(err.stack);
   res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();

 });

// Start express server
server.listen(process.env.PORT, ()=>{

  console.log(`"${constants.site_name}" live on port ${process.env.PORT}`);

});

module.exports = {app, server};
