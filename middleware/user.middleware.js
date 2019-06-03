/**
 * User Middleware
 */

exports.findTerritory = (req, res, next) => {

  if(!req.session.congregation){
    res.status(HttpStatus.UNAUTHORIZED).send();
  }

  TerritoryModel.findByCongregation(req.session.congregation)
    .then(territory => {
      req.app.locals.territory = {territory};
      // init current object
      req.app.locals.territory.current = {};
      next();
    })
    .catch(e => next(e));

};
