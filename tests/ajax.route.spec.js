const {expect} = require('chai');
const request = require('supertest');

const app = require('../app');

describe('AJAX Dispatcher', () => {

  // it('should connect to server', (done) => {
  //
  //   request(app)
  //     .get('/')
  //     .expect(200, done);
  //
  // });
  //
  // it('should fail with NonExistentController', (done) => {
  //
  //   request(app)
  //     .get('/ajax/nocontroller/noaction')
  //     .expect(404)
  //     .end((err, res) => {
  //       expect(res.body.name).to.equal('NonExistentController');
  //       done();
  //     });
  //
  // });
  //
  // it('should fail with NonExistentAction', (done) => {
  //
  //   request(app)
  //     .get('/ajax/test/noaction')
  //     .expect(404)
  //     .end((err, res) => {
  //       expect(res.body.name).to.equal('NonExistentAction');
  //       done();
  //     });
  //
  // });
  //
  // it('should return correct string', (done) => {
  //
  //   request(app)
  //     .get('/ajax/Test/test-Action')
  //     .expect(200)
  //     .end((err, res) => {
  //       expect(res.text).to.equal('test action');
  //       done();
  //     });
  //
  // });
  //
  // it('should be case insensitive with params', (done) => {
  //
  //   request(app)
  //     .get('/ajax/test-two/test-action')
  //     .expect(200, done);
  //
  // });

});
