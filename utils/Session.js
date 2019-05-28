const appRoot = require('app-root-path');

const {SessionUninitialized} = require(`${appRoot}/errors`);

class Session {

  constructor(req){
    this.requiredProps = ['first_name', 'last_name', 'user_id', 'congregation'];
    this.session = req.session;
    if(!this.session){
      throw new SessionUninitialized(`No session object found on request object`);
    }
  }

  /**
   * Validate session properties by assuring
   * that the required data properties exist.
   * @return {Array} Array of invalid properties
   */
  validate(){
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
    let user = {
      first_name: this.session.first_name,
      last_name: this.session.last_name,
      user_id: this.session._id,
      congregation: this.session.congregation,
    };
    return this.user;
  }

  /**
   * Set user credentials
   * @param  {Object} user User credentials
   */
  set user(user){
    this.user = user;
  }

}

module.exports = Session;
