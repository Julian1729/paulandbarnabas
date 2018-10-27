const expect = require('expect.js');

describe('Constants Loader', () => {


  it('should load local constants w/ testing env', () => {
    // set mode to testing
    process.env.NODE_ENV = 'testing';
    //set env to
    const config = require('../config/constants');
    expect(config).to.be.ok();
    expect(config.mode).to.eql('local');
  });

  it('should load local constants w/ development env', () => {
    // set mode to testing
    process.env.NODE_ENV = 'development';
    //set env to
    const config = require('../config/constants');
    expect(config).to.be.ok();
    expect(config.mode).to.eql('local');
  });

});
