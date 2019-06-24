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

const validateProfileInput = data => {
  let errors = {};
  let arr = ['handle', 'status', 'skills', 'website', 'tengxunkt', 'wangyikt', 'githubusername'];

  Object.assign(data, mapAttribute(arr, data));
  const { handle, status, skills, website, tengxunkt, wangyikt, githubusername } = data;

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

  if (!Validator.isEmpty(tengxunkt)) {
    if (!Validator.isURL(tengxunkt)) {
      errors.tengxunkt = 'tengxunkt URL不合法';
    }
  }

  if (!Validator.isEmpty(wangyikt)) {
    if (!Validator.isURL(wangyikt)) {
      errors.wangyikt = 'wangyikt URL不合法';
    }
  }

  if (!Validator.isEmpty(githubusername)) {
    if (!Validator.isURL(githubusername)) {
      errors.githubusername = 'githubusername URL不合法';
    }
  }

  return {
    errors: errors,
    isValid: isEmpty(errors)
  };
}

module.exports = validateProfileInput;