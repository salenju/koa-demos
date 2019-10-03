const Validator = require('validator');
const tools = require('../config/tools');

const validateRegisterInput = (data) => {
  let errors = {}

  // 验证name
  if (Validator.isEmpty(data.name)) {
    errors.name = '名字不能为空'
  } else if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = '名字的长度不能小于2且不能大于30';
  }

  // 验证email
  if (Validator.isEmpty(data.email)) {
    errors.email = '邮箱不能为空'
  } else if (!Validator.isEmail(data.email)) {
    errors.email = '邮箱格式不正确';
  }

  // 验证password
  if (Validator.isEmpty(data.password)) {
    errors.password = '密码不能为空';
  } else if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = '密码的长度不能小于6且不能大于30';
  }

  // 验证两次password是否一致
  if (Validator.isEmpty(data.comfirmPassword)) {
    errors.comfirmPassword = '确认密码不能为空'
  } else if (data.password !== data.comfirmPassword) {
    errors.comfirmPassword = '两次密码不一致';
  }

  return {
    errors,
    isValid: tools.isEmpty(errors)
  }
}

module.exports = validateRegisterInput

