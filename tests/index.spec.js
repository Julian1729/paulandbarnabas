const {expect} = require('chai');
const appRoot = require('app-root-path');

describe('Index Include', () => {

  it('should include objects', () => {

    const {test} = require(`${appRoot}/config`);
    expect(test.another).to.equal('anotherOne');

  });

});
