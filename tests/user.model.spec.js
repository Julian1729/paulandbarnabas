const expect = require('expect.js');

const db = require('../models/db');
const User = require('../models/User');
const Utils = require('../utils/utils');

describe('User Model', () => {

  /**
   * Clear User collection before every test
   */
  beforeEach((done) => {
    // remove all users from db before running test
    Utils.clearCollection(User).then(() => done()).catch((e) => done(e));
  });

  var userData = {
    first_name: 'Julian',
    last_name: 'Hernandez',
    email: 'hernandez.julian17@gmail.com',
    title: 'Ministerial Servant',
    password: 'newpasssword'
  };

  it('should save user to the database', (done) => {

      var user = new User(userData);
      user.save().then((doc)=>{
        User.find({}).then((users) => {
          expect(users.length).to.be(1);
          expect(users[0].first_name).to.eql(userData.first_name);
          return done();
        });
      }, (e) => {
        done(e);
      });

  });

  it('should hash the users password', (done) => {

    var user = new User(userData);
    user.save().then((doc)=>{
      User.find({}).then((users) => {
        expect(users.length).to.be(1);
        expect(users[0].first_name).to.be(userData.first_name);
        expect(users[0].password).to.not.eql(userData.password);
        return done();
      });
    }, (e) => {
      done(e);
    });

  });

  it('should not re-hash the users password', (done) => {

    var user = new User(userData);
    // Inject user into database
    user.save().then((doc)=>{
      expect(doc).to.be.ok();
      var ogPassword = doc.password
      var ogId = doc._id;
      // Find the user just entered and update first name only
      User.findById(ogId).then((testUser) => {
        //expect(users.length).to.eql(1);
        //var testUser = users[0];
        expect(testUser).to.be.ok();
        var newFirstName = 'John Doe';
        testUser.first_name = newFirstName;
        testUser.save().then((updatedUser) => {
          expect(updatedUser.first_name).to.eql(newFirstName);
          expect(updatedUser.password).to.eql(ogPassword);
          return done();
        });
      }).catch((e) => done(e));
    }, (e) => {
      done(e);
    });


  });

  it('should re-hash the users password', (done) => {

    var user = new User(userData);
    // Inject user into database
    user.save().then((doc)=>{
      expect(doc).to.be.ok();
      var ogPassword = doc.password
      var ogId = doc._id;
      // Find the user just entered and update password
      User.findById(ogId).then((testUser) => {
        expect(testUser).to.be.ok();
        var newPasssword = 'thisisnewpassword';
        testUser.password = newPasssword;
        testUser.save().then((updatedUser) => {
          expect(updatedUser.password).to.not.eql(ogPassword);
          return done();
        });
      }).catch((e) => done(e));
    }, (e) => {
      done(e);
    });


  });

  // OPTIMIZE: Test that user input can be re bcrpted and then compared

});
