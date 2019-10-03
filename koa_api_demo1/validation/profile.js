const Validator = require('validator');
const tools = require('../config/tools');

const mapAttribute = (arr, obj) => {
  let tarResult = {};
  if (Array.isArray(arr) && arr.length !== 0) {
    arr.map(item => {
      !tools.isEmpty(obj[item])
        ? tarResult[item] = obj[item]
        : tarResult[item] = ''
    })
  }
  return tarResult;
}

const validateProfileInput = data => {
  let errors = {}
  let arr = ['handle', 'website', 'status', 'skills', 'githubusername'];

  Object.assign(data, mapAttribute(arr, data));
  const { handle, status, skills, website, githubusername } = data;

  if (Validator.isEmpty(handle)) {
    errors.handle = 'handle不能为空';
  } else if (!Validator.isLength(handle, { min: 2, max: 40 })) {
    errors.handle = 'handle的长度不能小于2且不能大于40';
  }

  if (Validator.isEmpty(status)) {
    errors.status = 'status不能为空';
  }

  if (Validator.isEmpty(skills)) {
    errors.skills = 'skills不能为空';
  }

  if (!Validator.isEmpty(website)) {
    if (!Validator.isURL(website)) {
      errors.website = 'website URL不合法';
    }
  }
  
  

    return {
      errors,
      isValid: tools.isEmpty(errors)
    }
  };

  module.exports = validateProfileInput;