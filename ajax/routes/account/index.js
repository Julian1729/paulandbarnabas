const express = require('express');
const router = express.Router({mergeParams: true});
const appRoot = require('app-root-path');

router.post('/register', (req, res) => {
  res.send('POST /account/register');
});

router.post('/login', (req, res) => {
  res.send('POST /account/login');
});
