const expect = require('expect.js');
const appRoot = require('app-root-path');

describe('Configuration', () => {

  /**
   * Reset NODE_ENV to emulate the start of execution,
   * and delete config from cache to cause reload
   */
  beforeEach(() => {
    // FIXME: this does not delete all added
    // env vars before each test
    process.env.NODE_ENV = '';
    delete require.cache[require.resolve(`${appRoot}/config/config`)];
  });

  it('should set development variables', () => {
    process.env.NODE_ENV = 'development';
    const config = require(`${appRoot}/config/config`);
    expect(process.env).to.have.property('MONGODB_URI');
    expect(process.env.MONGODB_URI).to.eql('mongodb://localhost:27017/PaulAndBarnabas');
  });

  it('should default to development', () => {
    // leave process.env.NODE_ENV at null
    const config = require(`${appRoot}/config/config`);
    expect(process.env.NODE_ENV).to.eql('development');
  });

  it('should set testing variables', () => {
    process.env.NODE_ENV = 'test';
    expect(process.env.NODE_ENV).to.eql('test');
    const config = require(`${appRoot}/config/config`);
    expect(process.env.NODE_ENV).to.eql('test');
    expect(process.env.MONGODB_URI).to.eql('mongodb://localhost:27017/PaulAndBarnabasTesting');
  });

});
