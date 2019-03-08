const {expect} = require('chai');
const request = require('supertest');

const {app} = require('../app');

describe('Unit Rajax Route', () => {

  it('should respond with 400 for empty unit_ref', (done) => {

    request(app)
      .get('/rajax/unit/123unitis123')
      .expect(400)
      .end(done);

  });

});
