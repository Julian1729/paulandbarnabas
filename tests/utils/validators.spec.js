const {expect} = require('chai');
const appRoot = require('app-root-path');

describe('utils/validators', () => {

  it('should expose all validators', () => {

    let validators = require(`${appRoot}/utils/validators`);
    expect(validators.createFragmentValidator).to.exist;
    expect(validators.createTerritoryValidator).to.exist;
    expect(validators.loginValidator).to.exist;
    expect(validators.sessionValidator).to.exist;
    expect(validators.signupValidator).to.exist;

  });

});
