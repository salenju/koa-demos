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

const validateExperienceInput = data => {
  let errors = {};
  let arr = ['current', 'title', 'company', 'location', 'from', 'to', 'description'];

  Object.assign(data, mapAttribute(arr, data));
  const { current, title, company, location, from, to,description } = data;

  if (Validator.isEmpty(title)) {
    errors.title = 'title不能为空';
  } else if (!Validator.isLength(title, { min: 2, max: 40 })) {
    errors.title = 'title的长度不能小于2且不能大于40';
  }

  if (Validator.isEmpty(company)) {
    errors.company = 'company不能为空';
  }

  if (Validator.isEmpty(from)) {
    errors.from = 'from不能为空';
  }

  return {
    errors: errors,
    isValid: isEmpty(errors)
  };
}

module.exports = validateExperienceInput;