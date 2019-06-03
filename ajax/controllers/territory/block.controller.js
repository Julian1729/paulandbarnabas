/**
 * AJAX Block controller
 */
const appRoot = require('app-root-path');
const HttpStatus = require('http-status-codes');

const errors = require(`${appRoot}/errors`);
const {logger} = require(`${appRoot}/utils`);

exports.addTag = (req, res) => {

  let tag = req.query.tag || null;

  if(!tag){
    return res.status(HttpStatus.NOT_ACCEPTABLE).send();
  }

  let territory = req.app.locals.territory;
  let block = territory.current.block;

  block.addTag(tag);

  territory.territory.save()
    .then(territory => {
      return res.send();
    })
    .catch(e => {
      console.log(e.stack);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    });

};

exports.removeTag = (req, res) => {

  let tag = req.query.tag || null;

  if(!tag){
    return res.status(HttpStatus.NOT_ACCEPTABLE).send();
  }

  let territory = req.app.locals.territory;
  let block = territory.current.block;

  block.removeTag(tag);

  territory.territory.save()
    .then(territory => {
      return res.send();
    })
    .catch(e => {throw e});

};

exports.addWorkedRecord = (req, res) => {

  let territory = req.app.locals.territory;
  let block = territory.current.block;

  let timestamp = req.query.time;

  block.work(timestamp);

  territory.territory.save()
    .then(t => {
      return res.send();
    })
    .catch(e => {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    });

};
