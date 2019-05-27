const expect = require('expect.js');
const appRoot = require('app-root-path');

const envVars = require(`${appRoot}/config/env_vars`);

describe('Configuration', () => {

  let ogEnv = null;

  before(() => {

    // store initial environment
    ogEnv = process.env.NODE_ENV;

  });

  beforeEach(() => {
    // assure all added process.env properties are deleted
    let environments = Object.entries(envVars);
    for (env of environments) {
      let props = env[1];
      for (prop of Object.keys(props)) {
        delete process.env[prop];
        expect(process.env[prop]).to.equal(undefined);
      }
    }
    // reset env
    process.env.NODE_ENV = '';
    // unload config file
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

  it('should set test variables', () => {
    process.env.NODE_ENV = 'test';
    expect(process.env.NODE_ENV).to.eql('test');
    const config = require(`${appRoot}/config/config`);
    expect(process.env.NODE_ENV).to.eql('test');
    expect(process.env.MONGODB_URI).to.eql('mongodb://localhost:27017/PaulAndBarnabasTesting');
  });

  after(() => {

    // reset env to initial value
    process.env.NODE_ENV = ogEnv;

  });

});
