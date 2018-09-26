const expect = require('expect.js');

const db = require('../models/db');
const User = require('../models/User');
const Utils = require('../utils/utils');
const config = require('../config/config')();


describe('Mongo', () => {

  describe('Mongoose', () => {


    beforeEach((done) => {
      // remove all users from db before running test
      Utils.clearCollection(User).then(() => done()).catch((e) => done(e));
    });

    it('should connect to database', (done) => {
      expect(db).to.be.a('object');
      return done();
    });

    it('should save a user to test database', (done) => {
      var me = new User({name: 'Julian Hernandez'});
      me.save().then((doc) => {
        expect(doc).to.not.be.empty();
        expect(doc.db.name).to.be(config.mongo.db_name);
        done();
      })
      .catch((e) => {
        console.log(e);
        done();
      });
    });

  });


});
