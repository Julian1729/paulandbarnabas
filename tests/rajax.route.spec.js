const {expect} = require('chai');
const request = require('supertest');

const {app} = require('../app');

describe('Rajax Router', () => {

  it('should not find router and send 404', (done) => {

    request(app)
      .get('/rajax/nonexistentrouter')
      .expect(404)
      .end(done);

  });

  it('should find unit router', (done) => {

    request(app)
      .get('/rajax/territory/unit/123unitid123')
      .expect(200)
      .end(done);

  });

  it('should not find unit router', (done) => {

    request(app)
      .get('/rajax/territory/unit')
      .expect(404)
      .end(done);

  });


});
