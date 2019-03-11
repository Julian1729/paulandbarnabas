const session = require('supertest-session');



var {app} = require('../app');

var testSession = null;

describe('Territory Rajax', () => {

  /**
   * Seed database
   */
  before((done) => {

    require('../dev/seed/populate')(true)
      .then(done)
      .catch(e => done(e));

  });

  var authenticatedSession;
  beforeEach(function (done) {

    testSession = session(app);

    testSession.post('/ajax/account/login')
      .send({ email: 'hernandez.julian17@gmail.com', password: 'julianspassword' })
      .expect(200)
      .end(function (err) {
        if (err) return done(err);
        authenticatedSession = testSession;
        return done();
      });
      
  });

  it('find territory object', function (done) {
    authenticatedSession.get('/rajax/territory/test')
      .expect(200)
      .end(done);
  });

});
