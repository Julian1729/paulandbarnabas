const express = require('express');
const router = express.Router({mergeParams: true});
const appRoot = require('app-root-path');

const {accountController} = require(`${appRoot}/ajax/controllers`);

router.post('/register', (req, res) => {
  res.send('POST /account/register');
});

router.post('/login', accountController.login);

module.exports = router;
