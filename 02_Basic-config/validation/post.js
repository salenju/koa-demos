const Validator = require('validator');
const tools = require('../config/tools');

const { isEmpty } = tools;

const validatePostInput = data => {
  let errors = {};

  if (Validator.isEmpty(text)) {
    errors.text = 'text不能为空';
  } else if (!Validator.isLength(text, { min: 10, max: 400 })) {
    errors.text = 'text的长度不能小于10且不能大于400';
  }

  return {
    errors: errors,
    isValid: isEmpty(errors)
  };
}

module.exports = validatePostInput;