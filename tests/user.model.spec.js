const expect = require('expect.js');

const db = require('../models/db');
const User = require('../models/User');
const Utils = require('../utils/utils');

describe('User Model', () => {

  beforeEach((done) => {
    // remove all users from db before running test
    Utils.clearCollection(User).then(() => done()).catch((e) => done(e));
  });

  var userData = {
    first_name: 'Julian',
    last_name: 'Hernandez',
    email: 'hernandez.julian17@gmail.com',
    title: 'Ministerial Servant',
    password: 'thisismypassword'
  };

  it('should save user to the database', (done) => {

      var user = new User(userData);
      user.save().then((doc)=>{
        User.find().then((users) => {
          expect(users.length).to.be(1);
          expect(users[0].first_name).to.be(userData.first_name);
          done();
        });
      }, (e) => {
        done(e);
      });

  });


});
