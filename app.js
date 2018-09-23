const path = require('path');
const http = require('http');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');


const publicPath = path.join(__dirname, '/public');
const config = require('./config/config.js')('development');
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
 // Body Parser
 app.use(bodyParser.urlencoded({extended: false}));
 // Session
 app.use(session({secret: 'julianiscool', saveUninitialized: false, resave: false}));

/**
 * Express Routing
 */
 // Landing page (Login Page)
 app.use('/', require('./routes/Login') );

 // Sign Up
 app.use('/createaccount', require('./routes/CreateAccount'));

 // AJAX Requests
 app.use('/ajax/:controller', require('./routes/ajax'));

// Start express server
server.listen(config.port, ()=>{
  console.log(`"${constants.site_name}" live on port ${config.port}`);
});
