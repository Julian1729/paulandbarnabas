/**
 * Test winston logger config
 */

const fs = require('fs');
const {expect} = require('chai');
const appRoot = require('app-root-path');

const {logger} = require(`${appRoot}/utils`);


describe('Logger', () => {

  var ogEnv = null;

  it('should log debug message to console', () => {

    logger.debug('this is a debug log');

  });

  it('should log info message to console', () => {

    logger.info('this is a info log');

  });

  describe('File logging', () => {

    before(() => {
      // store current env in var
      ogEnv = process.env.NODE_ENV;
      // set env production
      process.env.NODE_ENV = 'production';
    });

    after(() => {
      // revert back to original environment
      process.env.NODE_ENV = ogEnv;
    });

    it('should be in production', () => {

      expect(process.env.NODE_ENV).to.equal('production');

    });

    // FIXME: this should be tested again, file wasnt being created
    // it('should log to file', () => {
    //
    //   let path = `${appRoot}/logs/pb.log`;
    //
    //   logger.info('this should log to file');
    //   fs.access(path, fs.F_OK, (err) => {
    //     if (err) {
    //       throw new Error(`${path} should exist`);
    //     }
    //   });
    //
    // });

  });

});
