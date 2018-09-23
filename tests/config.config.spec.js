const expect = require('expect.js');

const config = require('../config/config');

describe('Configuration', () => {

  it('set testing environmental variable', () => {
    expect(process.env.NODE_ENV).to.be('testing');
  });

  it('should be in development mode', () => {
    var c = config('development');
    expect(c.mode).to.be('development');
  });

  it('should be in production mode', () => {
    var c = config('production');
    expect(c.mode).to.be('production');
  });

  it('should be in testing mode', () => {
    var c = config();
    expect(c.mode).to.be('testing');
  });

  it('should return testing config', () => {
    var c = config('testing');
    expect(c).to.eql(config('testing'));
  });

  it('should return correct Configuration', () => {
    var c = config('development');
    expect(c).to.eql({
      mode: 'development',
      port: 3000,
      base_url: "http://localhost:3000",
      mongo: {
        url: 'localhost',
        port: 27017,
        db_name: 'PaulAndBarnabas'
      }
    });
  });

});
