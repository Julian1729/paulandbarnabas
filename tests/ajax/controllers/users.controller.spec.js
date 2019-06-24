const sinon = require('sinon');
const _ = require('lodash');
const chai = require('chai');
const {ObjectId} = require('mongodb');
const expect = chai.expect;
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const HttpStatus = require('http-status-codes');
const {mockResponse, mockRequest} = require('mock-req-res');
const appRoot = require('app-root-path');

const {helpers, AjaxResponse} = require(`${appRoot}/utils`);
const {UserModel, CongregationModel} = require(`${appRoot}/models`);
const userSeed = require(`${appRoot}/tests/seed/user.seed`);
const congregationSeed = require(`${appRoot}/tests/seed/congregation.seed`);
const usersController = require(`${appRoot}/ajax/controllers/users`);

describe('Users Controller', () => {

  describe('list', () => {

    let seedCongregation = null;
    let seedUser = null;

    before(async () => {

      // clear users collection
      await helpers.clearCollection(UserModel);
      // clear congregation collection
      await helpers.clearCollection(CongregationModel);
      // enter seed congregation
      seedCongregation = await CongregationModel.create(congregationSeed.validCongregation);
      // define seed users
      let usersToSeed = [
        {
          first_name: 'Julian',
          last_name: 'Hernandez',
          email: 'hernandez.julian17@gmail.com',
          phone_number: '(215)400-0468',
          title: 'Ministerial Servant',
          password: 'newpasssword',
          congregation: seedCongregation._id
        },
        {
          first_name: 'Betzaida',
          last_name: 'Hernandez',
          email: '1969b7@gmail.com',
          phone_number: '(215)629-6210',
          title: 'Regular Pioneer',
          password: 'passwordhere',
          congregation: seedCongregation._id
        },
        {
          first_name: 'Julio',
          last_name: 'Hernandez',
          email: 'hernandez.julio212@gmail.com',
          phone_number: '(215)629-6208',
          title: 'Elder',
          password: 'juliopassword',
          congregation: seedCongregation._id
        },
        {
          first_name: 'Michael',
          last_name: 'Scott',
          email: 'littlekidlover@gmail.com',
          phone_number: '(215)555-5555',
          title: 'Publisher',
          password: 'passwordduh',
          congregation: new ObjectId()
        },
      ];
      // seed to db
      let seedUsers = await UserModel.create(usersToSeed);

      seedUser = seedUsers[0];

    });

    it('should generate list of users belonging to congregation in session', async () => {

      sinon.spy(AjaxResponse.prototype, 'data');

      let req = mockRequest({session: {congregation: seedCongregation._id}});
      let res = mockResponse();

      await usersController.list(req, res);
      expect(AjaxResponse.prototype.data).to.have.been.calledOnce;
      expect(AjaxResponse.prototype.data.getCall(0).args[0]).to.equal('users');
      expect(AjaxResponse.prototype.data.getCall(0).args[1]).to.have.lengthOf(3);
      expect(res.json).to.have.been.calledOnce;

      AjaxResponse.prototype.data.restore();

    });

  });

});
