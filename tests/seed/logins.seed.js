const validLogin = {
  email: 'hernandez.julian17@gmail.com',
  password: 'thisismypassord'
};

const invalidLogins = {
  emptyEmail: {
    email: '',
    password: 'thisismypassword'
  },
  emptyPassword: {
    email: 'hernandez.julian17@gmail.com',
    password: ''
  }
}

module.exports = {
  validLogin,
  invalidLogins
};
