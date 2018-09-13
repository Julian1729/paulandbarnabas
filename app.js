const path = require('path');
const express = require('express');

const publicPath = path.join(__dirname, '/public');
const config = require('./config/config.js')('development');

var app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');


app.use(express.static(publicPath));

app.get('/', function (req, res) {
  res.render('index', { title: 'Hey', message: 'Hello there!' })
})

app.listen(config.port, ()=>{
  console.log(`server is up on port ${config.port}`);
});
