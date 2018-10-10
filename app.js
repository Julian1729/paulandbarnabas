const path = require('path');
const http = require('http');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');


const publicPath = path.join(__dirname, '/public');
const config = require('./config/config.js')();
const constants = require('./config/constants.js');

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
   res.locals.config = config;
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

 // Dasboard
 app.use('/dashboard', require('./routes/Dashboard'));

// Start express server
server.listen(config.port, ()=>{
  console.log(`"${constants.site_name}" live on port ${config.port}`);
});
