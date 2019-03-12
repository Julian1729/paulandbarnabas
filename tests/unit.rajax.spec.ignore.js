

describe('Unit Rajax Route', () => {

  before((done) => {

    // seed database
    require('../dev/seed/populate')(true)
      .then(done)
      .catch(e => done(e));

  });

  var authenticatedSession;
  beforeEach(function (done) {

    initSession = session(app);

    initSession.post('/ajax/account/login')
      // use unhashed user seed data
      .send({ email: user_seed_data[0].email, password: user_seed_data[0].password})
      .expect(200)
      .end(function (err) {
        if (err) return done(err);
        authenticatedSession = initSession;
        return done();
      });
  });

  it('should allow territory methods', () => {

    var street = seed_data.territories.findStreet('Oakland');
    expect(street).to.exist;

  });

  // FIXME: adapt to new route structure
  // it('should find the correct unit', (done) => {
  //
  //   let street = 'Oakland';
  //   let hundred = 4500;
  //   let unit = 4502;
  //
  //   authenticatedSession
  //     .post(`/rajax/territory/unit/${street}/${hundred}/${unit}`)
  //     .expect(200)
  //     .end(done);
  //
  // });
  //
  // it('should find requested unit and respond w/ 404', (done) => {
  //
  //   let street = 'Oakland';
  //   let hundred = 4500;
  //   let unit = 4599;
  //
  //   authenticatedSession
  //     .post(`/rajax/territory/unit/${street}/${hundred}/${unit}`)
  //     .expect(404)
  //     .end(done);
  //
  // });

});
