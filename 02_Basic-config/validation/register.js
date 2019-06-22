const Validator = require('validator');
const tools = require('../config/tools');

const validateRegisterInput = (data) => {
  let errors = {};

  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = '名字的长度不能小于2且不能大于30';
  }

  return {
    errors,
    isValid: tools.isEmpty(errors)
  };
}

module.exports = validateRegisterInput