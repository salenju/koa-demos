const Validator = require('validator');
const tools = require('../config/tools');

const validateLoginInput = data => {
  let errors = {}

  // 验证email
  if (Validator.isEmpty(data.email)) {
    errors.email = '邮箱不能为空'
  } else if (!Validator.isEmail(data.email)) {
    errors.email = '邮箱格式不正确'
  }

  // 验证password
  if (Validator.isEmpty(data.password)) {
    errors.password = '密码不能为空'
  } else if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = '密码的长度不能小于6且不能大于30';
  }

  return {
    errors,
    isValid: tools.isEmpty(errors)
  }
}

module.exports = validateLoginInput;
