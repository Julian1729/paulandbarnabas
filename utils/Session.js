const _ = require('lodash');
const appRoot = require('app-root-path');

const {SessionUninitialized} = require(`${appRoot}/errors`);

class Session {

  constructor(req){
    this.requiredProps = ['first_name', 'last_name', 'user_id', 'congregation'];
    this.req = req;
    if(this.req.session){
      this.session = this.req.session;
    }
  }

  /**
   * Check whether request has
   * session property initialized
   * @return {Boolean} [description]
   */
  hasSession(){
    return Boolean(this.session);
  }

  /**
   * Create session with required
   * user information.
   * @param  {Object} user User object from database
   */
  create(user){
    if(!this.hasSession()){
      this.req.session = {};
      // attach session to instance
      this.session = this.req.session;
    }
    this._user = user;;
    let sessionData = {
      first_name: this.user.first_name,
      last_name: this.user.last_name,
      user_id: this.user._id,
      congregation: this.user.congregation
    };
    _.assign(this.session, sessionData);
    // now validate session
    let missingData = this.validate();
    if(missingData.length){
      throw new SessionUninitialized(`Missing ${missingData.join(', ')} on user object`);
    }
  }

  /**
   * Validate session properties by assuring
   * that the required data properties exist.
   * @return {Array} Array of invalid properties
   */
  validate(){
    if(!this.hasSession()){
      throw new SessionUninitialized('No session found on request object');
    }
    let invalid = [];
    for (let prop of this.requiredProps) {
      if(!this.session[prop]){
        invalid.push(prop);
      }
    }
    return invalid;
  }

  /**
   * Check if session is valid
   * @return {Boolean} [description]
   */
  isValid(){
    return this.validate().length === 0;
  }

  /**
   * Check if session is authenticated
   * @return {Boolean} [description]
   */
  isAuthenticated(){
    return this.session.authenticated === true ? true : false;
  }

  /**
   * Check if user is congregation admin
   * @return {Boolean} [description]
   */
  isAdmin(){
    return this.session.isAdmin === true ? true : false;
  }

  /**
   * Get user credentials
   * @return {Object} User name, id and congregation
   */
  get user(){
    return this._user;
  }

  /**
   * Set user. Only to satisfy
   * es6 standards of setter and getter pair.
   * @param  {Object} user User
   * @return {[type]}      [description]
   */
  set user(user){
    this._user = user;
  }

}

module.exports = Session;
