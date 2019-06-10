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
    const statusCodes = {

      SUCCESS: 1,

      SERVER_ERROR: 2,

      FORM_VALIDATION_ERROR: 3

    };

    this.statusCodes = statusCodes;

    this._payload = {
      data: {},
      error: {},
      status: statusCodes.SUCCESS
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
   * Set
   * @return {[type]} [description]
   */
  status(code){
    if(!_.find(Object.keys(this.statusCodes), code)){
      throw new Error(`"${code}" is not a valid AjaxResponse status code`);
    }
    this.payload.status = code;
  }

  set payload(payload){
    this._payload = payload;
  }

  get payload(){
    return this._payload;
  }

}

module.exports = AjaxResponse;
