const expect = require('expect.js');

const mongoose = require('../models/mongoose');


describe('Mongo', () => {

  describe('Mongoose', () => {

    it('should connect to databas', () => {
      expect(mongoose).to.be.a('object');
    });

  });


});
