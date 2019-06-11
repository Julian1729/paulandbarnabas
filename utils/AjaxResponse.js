/**
 * AJAX Response Interface
 */
const _ = require('lodash');
const dotProp = require('dot-prop');

class AjaxResponse{

  /**
   * Attach Express response object
   * and set default dataObject. Attach status
   * codes to object.
   * @param  {Object} res Express response object
   */
  constructor(res){
    if(!res){
      throw new Error('AjaxResponse expecting express response object in constructor');
    }
    this.res = res;

    this._payload = {
      data: {},
      error: {}
    };

  }

  set payload(payload){
    this._payload = payload;
  }

  get payload(){
    return this._payload;
  }

  /**
   * Explicitly specify the error types
   * that endpoint can respond with to
   * lend to more readable code.
   * @param {Array} errors Array of error types
   */
  set validErrors(errors){

    this._validErrors = errors;

  }

  get validErrors(){

    return this._validErrors;

  }

  /**
   * Send JSON response
   */
  send(){
    this.res.json(this.payload);
  }

  /**
   * Overwrite default
   * @param  {Object} dataBase Base data object
   */
  dataBase(dataBase){
    _.defaults(this._payload.data, dataBase);
    return this;
  }

  /**
   * Set or get a data property. If second
   * paramter value is passed in, it will
   * replace the value that wouuld have been set.
   * @param {String} dotNotation Dot notation locator
   * @param {Mixed} value Optional value to set
   * @return {Mixed} If value is not passed, will return
   * found value for dot notation
   */
  data(dotNotation, value){
    if(!value){
      return dotProp.get(this.payload.data, dotNotation);
    }
    dotProp.set(this.payload.data, dotNotation, value);
  }

  /**
   * Set error on payload
   * with type and message
   * and optional extra params.
   * @param  {String} type Standard error type
   * @param  {String} msg Error message
   * @param {Object} props Extra properties to add to error object
   */
  error(type, msg, props){
    if(_.indexOf(this.validErrors, type) === -1){
      throw new Error(`"${type}" is not specified as a valid error for this endpoint.`)
    }
    this.payload.error.type = type;
    this.payload.error.message = msg;
    _.extend(this.payload.error, props);
    return this;

  }

}

module.exports = AjaxResponse;
