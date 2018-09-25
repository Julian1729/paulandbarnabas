const expect = require('expect.js');

//const db = require('../models/db');
const User = require('../models/User');
const Utils = require('../utils/utils');

describe('Utils', () => {

  it('should delete all users in the User collection', (done) => {

    Utils.clearCollection(User).then(() => {
      User.find({}).then((users) => {
        expect(users.length).to.be(0);
        done();
      }).catch((e) => {
        done(e);
      });
    });

  });

});
