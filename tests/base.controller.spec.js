const Controller = require('../controllers/Base');
const expect = require('expect.js');
const config = require('../config/config');

describe("Base Controller", () => {

  describe("Extend", () => {

    it('should be extendable', () => {
      var newProp = 'newProp';
      var newController = Controller.extend({
        newProp
      });
      expect(newController).to.have.property('newProp', newProp);
    });

    it('should overwrite properties', () => {
      var newName = 'Test Controller';
      var extendedController = Controller.extend({
        'name': newName
      });
      expect(extendedController.name).to.be(newName);
    });

  });

});
