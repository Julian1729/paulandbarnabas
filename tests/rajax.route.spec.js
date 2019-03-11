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

});
