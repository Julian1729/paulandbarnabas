const HttpStatus = require('http-status-codes');
const _ = require('lodash');

/**
 * Send back a standard JSON response to an ajax request
 * @param  {[Object]} res Express response object to be able to execute response
 * @param  {[Object]} options Object used to pass in options {status: (http status code, default 200), message: {String}, data: null | object, validation: validation errors obj}
 * @param  {[Number]} httpStatus HTTP status code
 * @return {[void]}
 */
var ajaxResponse = (res, options, httpStatus) => {

  var responseBase = {
    status: HttpStatus.OK,
    data: null,
    error: null
  };

  var response = _.extend({}, responseBase, options);

  if(httpStatus){
    res.status(httpStatus).json(response);
  }else{
    res.json(response);
  }

  return;

};

module.exports = {
  ajaxResponse
};
