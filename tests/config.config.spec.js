const expect = require('expect.js');


describe('Configuration', () => {

  /**
   * Reset NODE_ENV to emulate the start of execution,
   * and delete config from cache to cause reload
   */
  beforeEach(() => {
    // FIXME: this does not delete all added
    // env vars before each test
    process.env.NODE_ENV = '';
    delete require.cache[require.resolve('../config/config')];
  });

  it('should set development variables', () => {
    process.env.NODE_ENV = 'development';
    const config = require('../config/config');
    expect(process.env).to.have.property('MONGODB_URI');
    expect(process.env.MONGODB_URI).to.eql('mongodb://localhost:27017/PaulAndBarnabas');
  });

  it('should default to development', () => {
    // leave process.env.NODE_ENV at null
    const config = require('../config/config');
    expect(process.env.MODE).to.eql('development');
  });

  it('should set testing variables', () => {
    process.env.NODE_ENV = 'testing';
    expect(process.env.NODE_ENV).to.eql('testing');
    const config = require('../config/config');
    expect(process.env.MODE).to.eql('testing');
    expect(process.env.MONGODB_URI).to.eql('mongodb://localhost:27017/PaulAndBarnabasTesting');
  });

});
