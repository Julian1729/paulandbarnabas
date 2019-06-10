const chai = require('chai');
const sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.should();
chai.use(sinonChai);
const appRoot = require('app-root-path');
const {mockResponse} = require('mock-req-res');

const {AjaxResponse} = require(`${appRoot}/utils`);

describe('AjaxResponse', () => {

  it('should call send', () => {

    let res = mockResponse({});
    sinon.spy(res.send);
    let ajaxResponse = new AjaxResponse(res);
    ajaxResponse.send();
    res.send.should.have.been.calledWith(ajaxResponse.payload);

  });

  it('should set default data object response', () => {

    let res = mockResponse({});
    let ajaxResponse = new AjaxResponse(res);
    ajaxResponse.dataBase({
      units_added: 0,
      another_amount: 0,
      name: 'Unknown Name'
    });
    ajaxResponse.payload.should.have.property('data');
    ajaxResponse.payload.data.should.have.property('units_added');
    ajaxResponse.payload.data.units_added.should.equal(0);

  });

  describe('data', () => {

    it('should set data object value', () => {

      let res = mockResponse({});
      let ajaxResponse = new AjaxResponse(res);
      ajaxResponse.dataBase({
        units_added: 0,
        another_amount: 0,
        name: 'Unknown Name'
      });
      ajaxResponse.payload.data.units_added.should.equal(0);
      ajaxResponse.data('units_added', 12);
      ajaxResponse.payload.data.units_added.should.equal(12);

    });

    it('should set nested data object value', () => {

      let res = mockResponse({});
      let ajaxResponse = new AjaxResponse(res);
      ajaxResponse.dataBase({
        units_added: 0,
        another_amount: 0,
        name: {
          first: null,
          last: null
        }
      });
      ajaxResponse.data('name.first', 'Michael');
      ajaxResponse.data('name.last', 'Scott');
      ajaxResponse.payload.data.name.first.should.equal('Michael');
      ajaxResponse.payload.data.name.last.should.equal('Scott');

    });


    it('should get data object property on root', () => {

      let res = mockResponse({});
      let ajaxResponse = new AjaxResponse(res);
      ajaxResponse.dataBase({
        units_added: 0,
        another_amount: 0,
        name: 'Unknown Name'
      });
      ajaxResponse.data('units_added', 12);
      ajaxResponse.data('units_added').should.equal(12);

    });

    it('should get nested data object property', () => {

      let res = mockResponse({});
      let ajaxResponse = new AjaxResponse(res);
      ajaxResponse.dataBase({
        units_added: 0,
        another_amount: 0,
        name: {
          first: 'Michael',
          last: 'Scott'
        }
      });
      ajaxResponse.data('name.first').should.equal('Michael');

    });

    it('should return undefined for undefined path', () => {

      let res = mockResponse({});
      let ajaxResponse = new AjaxResponse(res);
      ajaxResponse.dataBase({
        units_added: 0,
        another_amount: 0,
        name: 'Unknown Name'
      });
      chai.expect(ajaxResponse.data('units_added.undefinedPath')).to.equal(undefined);

    });

  });

  describe('error', () => {

    it('should set error', () => {

      let res = mockResponse({});
      sinon.spy(res.send);
      let ajaxResponse = new AjaxResponse(res);
      ajaxResponse.error(ajaxResponse.errorTypes.FORM_VALIDATION_ERROR, 'This is the error message');
      ajaxResponse.send();
      res.send.should.have.been.calledWith({data:{}, error: {type: ajaxResponse.errorTypes.FORM_VALIDATION_ERROR, message: 'This is the error message'}});

    });

    it('should set error w/ additional props', () => {

      let res = mockResponse({});
      sinon.spy(res.send);
      let ajaxResponse = new AjaxResponse(res);
      ajaxResponse.error(ajaxResponse.errorTypes.FORM_VALIDATION_ERROR, 'This is the error message', {fields: ['one', 'two'], another: {this: 'one'}});
      ajaxResponse.send();
      res.send.should.have.been.calledWith({
        data:{},
        error: {
          type: 2,
          message: 'This is the error message',
          fields: ['one', 'two'],
          another: {this: 'one'}
        }
      });

    });

  });

});
