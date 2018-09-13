const path = require('path');
const express = require('express');

const publicPath = path.join(__dirname, '../public');
const config = require('../config/config.js')('development');

var app = express();

app.use(express.static(publicPath));

app.listen(config.port, ()=>{
  console.log(`server is up on port ${config.port}`);
});
