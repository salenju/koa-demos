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
  }
}

module.exports = tools;