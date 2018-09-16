const path = require('path');
const http = require('http');
const express = require('express');
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
app.use(bodyParser.urlencoded({extended: false}));

/**
 * Express Routes
 */
app.get('/', function (req, res) {
  res.render('index', { title: 'Hey', message: 'Hello there!' })
})


// Start express server
server.listen(config.port, ()=>{
  console.log(`"${constants.site_name}" live on port ${config.port}`);
});
