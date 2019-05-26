const {expect} = require('chai');
const appRoot = require('app-root-path');

const config = require(`${appRoot}/config/config`);

describe('models/', () => {

  it('should export all models', () => {

    let models = require(`${appRoot}/models`);
    expect(models.CongregationModel).to.exist;
    expect(models.TerritoryModel).to.exist;
    expect(models.UserModel).to.exist;

  });

});
