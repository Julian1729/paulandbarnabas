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

    // define app status codes
    const errorTypes = {

      SERVER_ERROR: 1,

      FORM_VALIDATION_ERROR: 2

    };

    this.errorTypes = errorTypes;

    this._payload = {
      data: {},
      error: {}
    };

  }

  /**
   * Send JSON response
   */
  send(){
    this.res.send(this.payload);
  }

  /**
   * Overwrite default
   * @param  {Object} dataBase Base data object
   */
  dataBase(dataBase){
    _.defaults(this._payload.data, dataBase);
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

    if(!_.find(Object.keys(this.errorTypes, type))){
      throw new Error(`"${type}" is not a valid AjaxResponse error type.`);
    }
    this.payload.error.type = type;
    this.payload.error.message = msg;
    _.extend(this.payload.error, props);

  }

  set payload(payload){
    this._payload = payload;
  }

  get payload(){
    return this._payload;
  }

}

module.exports = AjaxResponse;
