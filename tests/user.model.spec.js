const expect = require('expect.js');

const User = require('../models/User');
const Utils = require('../utils/utils');
const seed = require('./seed/User');

describe('User Model', () => {

  /**
   * Clear User collection before every test
   */
  beforeEach((done) => {
    // remove all users from db before running test
    Utils.clearCollection(User).then(() => done()).catch((e) => done(e));
  });


  /**
   * Ensure that a User can be saved to the db
   */
  it('should save user to the database', (done) => {

      var user = new User(seed.completeUser);
      user.save().then((doc)=>{
        User.find({}).then((users) => {
          expect(users.length).to.be(1);
          expect(users[0].first_name).to.eql(seed.completeUser.first_name);
          return done();
        });
      }, (e) => {
        done(e);
      });

  });

  /**
   * Passwords should be hashed before entering into the database
   */
  it('should hash the users password', (done) => {

    var user = new User(seed.completeUser);
    user.save().then((doc)=>{
      User.find({}).then((users) => {
        expect(users.length).to.be(1);
        expect(users[0].first_name).to.be(seed.completeUser.first_name);
        expect(users[0].password).to.not.eql(seed.completeUser.password);
        return done();
      });
    }, (e) => {
      done(e);
    });

  });

  /**
   * Ensure that passwords are not rehashed on update if they haven't been changed
   */
  it('should not re-hash the users password', (done) => {

    var user = new User(seed.completeUser);
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

  /**
   * Hashing middleware should activate on update after update
   */
  it('should re-hash the users password', (done) => {

    var user = new User(seed.completeUser);
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

  it('should not enter extra information', (done) => {

    var user = new User(seed.completeUser);
    user.save()
      .then(doc => {
        expect(doc).to.have.property('first_name');
        expect(doc).to.not.have.property('password_confirm');
        done();
      })
      .catch(e => done(e));

  });

  // OPTIMIZE: Test that user input can be re bcrpted and then compared

});
