const bcrypt = require('bcryptjs');

const tools = {
  // has a password
  enbcrypt: (password) => {
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(password, salt);
    return hash;
  },

  // check a password
  decode: (inputPassword, dbPassword) => {
    let result = bcrypt.compareSync(inputPassword, dbPassword);
    return result
  },

  isEmpty: (data) => {
    let result = data === '' || data === undefined || data === null ||
      (typeof data === 'object' && Object.keys(data).length === 0) ||
      (typeof data === 'string' && data.trim().length === 0);
    return result;
  },

};

module.exports = tools;