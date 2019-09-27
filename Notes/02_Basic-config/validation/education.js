const Validator = require('validator');
const tools = require('../config/tools');

const { isEmpty } = tools;

const mapAttribute = (itemArr, object) => {
  let tarResult = {}
  if (Array.isArray(itemArr) && itemArr.length !== 0) {
    itemArr.map(item => {
      !isEmpty(object[item])
        ? tarResult[item] = object[item]
        : tarResult[item] = ''
    })
  }
  return tarResult;
}

const validateEducationInput = data => {
  let errors = {};
  let arr = ['current', 'school', 'degree', 'fieldofstudy', 'from', 'to', 'description'];

  Object.assign(data, mapAttribute(arr, data));
  const { current, school, degree, fieldofstudy, from, to,description } = data;

  if (Validator.isEmpty(school)) {
    errors.school = 'school不能为空';
  } 

  if (Validator.isEmpty(degree)) {
    errors.degree = 'degree不能为空';
  }

  if (Validator.isEmpty(from)) {
    errors.from = 'from不能为空';
  }

  return {
    errors: errors,
    isValid: isEmpty(errors)
  };
}

module.exports = validateEducationInput;