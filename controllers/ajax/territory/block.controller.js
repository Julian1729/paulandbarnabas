/**
 * Rajax Street Controller
 */
const HttpStatus = require('http-status-codes');
const appRoot = require('app-root-path');

const {logger} = require(`${appRoot}/utils`);
const errors = require(`${appRoot}/errors`);

let middleware = {};
let endpoints = {};

/**
 * Middleware
 */
middleware.findBlock = (req, res, next) =>{

  let territory = req.app.locals.territory;
  let reqBlock = req.params.side;
  // make sure that req.param.block equals "odd" or "even"
  if(!reqBlock || !(reqBlock === 'odd' || reqBlock === 'even')){
    logger.debug(`${reqBlock} must equal "odd" or "even"`);
    return res.status(HttpStatus.NOT_ACCEPTABLE).send();
  }
  let block = territory.current.hundred[reqBlock];
  // attach to locals
  territory.current.block = block;
  logger.debug(`${block.hundred} hundred found`);
  return next();
};

/**
 * Endpoints
 */
endpoints.addTag = (req, res) => {

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

endpoints.removeTag = (req, res) => {

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

endpoints.addWorkedRecord = (req, res) => {

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


module.exports = {middleware, endpoints};
