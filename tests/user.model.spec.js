const expect = require('expect.js');
const chaiExpect = require('chai').expect;
const {ObjectId} = require('mongodb');
const session = require('supertest-session');


const Congregation = require('../models/Congregation');
const CongregationSeed = require('./seed/Congregation');
const User = require('../models/User');
const Utils = require('../utils/utils');
const UserSeed = require('./seed/User');
const {app} = require('../app');

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

      var user = new User(UserSeed.completeUser);
      user.save().then((doc)=>{
        User.find({}).then((users) => {
          expect(users.length).to.be(1);
          expect(users[0].first_name).to.eql(UserSeed.completeUser.first_name);
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

    var user = new User(UserSeed.completeUser);
    user.save().then((doc)=>{
      User.find({}).then((users) => {
        expect(users.length).to.be(1);
        expect(users[0].first_name).to.be(UserSeed.completeUser.first_name);
        expect(users[0].password).to.not.eql(UserSeed.completeUser.password);
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

    var user = new User(UserSeed.completeUser);
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

    var user = new User(UserSeed.completeUser);
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

    var user = new User(UserSeed.completeUser);
    user.save()
      .then(doc => {
        expect(doc).to.have.property('first_name');
        expect(doc).to.not.have.property('password_confirm');
        done();
      })
      .catch(e => done(e));

  });

  it('should find all users that belong to certain congrgation', (done) => {

    var seedCongregation = new Congregation(CongregationSeed.validCongregation);
    // CREATE CONREGATION
    seedCongregation.save()
      // CREATE USERS WITH CONGREGATION REFERENCE
      .then(congregation => {
        var user1 = {
          first_name: 'Julian',
          last_name: 'Hernandez',
          email: 'hernandez.julian17@gmail.com',
          email_confirm: 'hernandez.julian17@gmail.com',
          phone_number: '2154000468',
          title: 'Ministerial Servant',
          password: 'newpasssword',
          password_confirm: 'newpasssword',
          congregation: new ObjectId(congregation._id)
        };

        var user2 = {
          first_name: 'Todd',
          last_name: 'Roberson',
          email: 'toddy@gmail.com',
          phone_number: '2153333333',
          title: 'Ministerial Servant',
          password: 'newpasssword',
          congregation: new ObjectId(congregation._id)
        };

        return User.collection.insertMany([user1, user2]);
      })
      // ATTEMPT TO FIND USERS THAT BELONG TO CONGREGATION
      .then(users => {
        User.find({congregation: seedCongregation._id})
          .then(users => {
            chaiExpect(users).to.have.lengthOf(2);
            done();
          })
          .catch(e => done(e));

      })
      .catch(e => done(e))

  });

  // OPTIMIZE: Test that user input can be re bcrpted and then compared

  describe('Uses Session', () => {

    var authenticatedSession;

    beforeEach((done) => {

    // enter valid user into db
    var user = new User(UserSeed.completeUser);
    user.save()
      .then( user => {

        var authAttempt = session(app);
        authAttempt
          .post('/ajax/account/login')
          .send({
            email: UserSeed.completeUser.email,
            password: UserSeed.completeUser.password
          })
          .expect(200)
          .end((err, req) => {
            authenticatedSession = authAttempt;
            done();
          });

      })
      .catch( e => done(e) );

    });

    it('should return list of all users', (done) => {

      var congregation = new ObjectId();

      var user1 = new User({
        first_name: 'Julian',
        last_name: 'Hernandez',
        email: 'user1@example.com',
        email_confirm: 'user1@example.com',
        phone_number: '2154000468',
        title: 'Ministerial Servant',
        password: 'newpasssword',
        password_confirm: 'newpasssword',
        congregation: congregation
      });

      var user2 = new User({
        first_name: 'Todd',
        last_name: 'Roberson',
        email: 'toddy@gmail.com',
        phone_number: '2153333333',
        title: 'Ministerial Servant',
        password: 'newpasssword',
        congregation: congregation
      });

      user1.save()
        .then(user => {
          return user2.save();
        })
        .then(user2 => {
          // FIND LIST
          return User.getUsersByCongregation(congregation);
        })
        .then(list => {
          chaiExpect(list).to.have.lengthOf(2);
          chaiExpect(list[0]).to.have.property('congregation');
          done();
        })
        .catch(e => done(e));

    });

  });

});
