const bcrypt = require('bcryptjs');

tools = {
  // 对密码通过hash加密
  encryptPwd: (password) => {
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(password, salt);
    return hash;
  },

  // 比较密码（比较输入密码和DB中的密码是否一致）
  comparePwd: (inputPwd, dbPwd) => {
    let compareResult = bcrypt.compareSync(inputPwd, dbPwd);
    return compareResult;
  },

  // 判断data是都为空
  isEmpty: (data) => {
    let result = data === '' ||
      data === null ||
      data === undefined ||
      (Array.isArray(data) && data.length === 0) ||
      (typeof data === 'object' && Object.keys(data).length === 0)

    return result;
  },
}

module.exports = tools;