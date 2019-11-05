const Router = require('koa-router');
const router = new Router();
const passport = require('koa-passport');

const Profile = require('../../model/Profile');
const User = require('../../model/Users');
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

/* 公用方法 */
const mapAttribute = (itemArr, object) => {
  let tarResult = {}
  if (Array.isArray(itemArr) && itemArr.length !== 0) {
    itemArr.map(item => {
      object[item]
        ? tarResult[item] = object[item]
        : null
    })
  }
  return tarResult;
}

/**
 * @route GET api/profile/test
 * @desc  测试接口地址
 * @access 接口是公开的
 */
router.get('/test', async ctx => {
  ctx.status = 200;
  ctx.body = { meg: 'profile works...' };
});

/**
 * @route GET api/profile
 * @desc  个人信息接口地址
 * @access 接口是私密的
 */
router.get('/', passport.authenticate('jwt', { session: false }), async ctx => {
  const { id } = ctx.state.user;  // 可以从token中获得user的信息

  /**
   *  Profile.find({user:id}).populate('user',['name','avatar'])
   *  Profile.find({user:id})——在Profile表中通过user:id来查找对应的用户
   *  populate('user',['name','avatar'])——关联users表，查找name,avatar字段,并join到查询到的user字段中
   * 
   *  《Mongoose 之 Population 使用》 https://segmentfault.com/a/1190000002727265
   */
  const profile = await Profile.find({ user: id }).populate('users', ['name', 'avatar']);

  if (profile.length > 0) {
    ctx.status = 200;
    ctx.body = profile;
  } else {
    ctx.status = 404;
    ctx.body = { msg: '未查询到该用户的信息' }
  }
});


/**
 * @route POST api/profile
 * @desc  个人信息接口地址(添加 / 修改)
 * @access 接口是私密的
 */

router.post('/', passport.authenticate('jwt', { session: false }), async ctx => {
  const _body = ctx.request.body;
  const { id } = ctx.state.user;  // 可以从token中获得user的信息

  // 检测用户输入信息是否合法
  const { errors, isValid } = validateProfileInput(_body);
  if (!isValid) {
    ctx.status = 400;
    ctx.body = errors;
    return;
  }

  const arr = ['handle', 'company', 'website', 'location', 'status', 'skills', 'bio', 'githubusername'];
  const arrSocial = ['wechat', 'QQ', 'tengxunkt', 'wangyikt'];

  let profileFields = {};

  if (id) {
    profileFields.user = id;
  }

  profileFields.social = mapAttribute(arrSocial, _body);
  Object.assign(profileFields, mapAttribute(arr, _body));

  const profile = await Profile.find({ user: id });

  if (profile.length > 0) {
    // update
    const profileUpdate = await Profile.findOneAndUpdate(
      { user: id },
      { $set: profileFields },
      { new: true }
    );
    ctx.body = profileFields;

  } else {
    // add
    // 存储到数据库
    await new Profile(profileFields).save()
      .then(profile => {
        ctx.status = 200;
        ctx.body = profile;
      })
  }
});

/**
 * @route GET api/profile/handle?handle=test
 * @desc  通过handle获取用户信息接口地址
 * @access 接口是公开的
 */
router.get('/handle', async ctx => {
  const { handle } = ctx.query;
  let errors = {};

  let profile = await Profile.find({ handle: handle }).populate('users', ['name', 'avatar']);
  if (profile.length === 0) {
    errors.noProfile = '未找到用户信息';
    ctx.status = 404;
    ctx.body = errors;
  } else {
    ctx.status = 200;
    ctx.body = profile[0];
  }
});

/**
 * @route GET api/profile/user_id?user_id=test
 * @desc  通过user_id获取用户信息接口地址
 * @access 接口是公开的
 */
router.get('/user_id', async ctx => {
  const { user_id } = ctx.query;
  let errors = {};

  let profile = await Profile.find({ user: user_id }).populate('users', ['name', 'avatar']);
  if (profile.length === 0) {
    errors.noProfile = '未找到用户信息';
    ctx.status = 404;
    ctx.body = errors;
  } else {
    ctx.status = 200;
    ctx.body = profile[0];
  }
});

/**
 * @route GET api/profile/all
 * @desc  获取所有用户信息接口地址
 * @access 接口是公开的
 */
router.get('/all', async ctx => {
  let errors = {};

  let profiles = await Profile.find({}).populate('users', ['name', 'avatar']);
  if (profiles.length === 0) {
    errors.noProfile = '没有找到任何用户信息';
    ctx.status = 404;
    ctx.body = errors;
  } else {
    ctx.status = 200;
    ctx.body = profiles;
  }
});


/**
 * @route POST api/profile/experience
 * @desc  添加experience接口地址
 * @access 接口是私密的
 */

router.post('/experience', passport.authenticate('jwt', { session: false }), async ctx => {
  const _body = ctx.request.body;
  const { id } = ctx.state.user;  // 可以从token中获得user的信息

  // 检测用户输入信息是否合法
  const { errors, isValid } = validateExperienceInput(_body);
  if (!isValid) {
    ctx.status = 400;
    ctx.body = errors;
    return;
  }

  const arrExp = ['title', 'current', 'company', 'location', 'from', 'to', 'description'];

  let profileFields = {};
  let error = {};
  profileFields.experience = [];

  // 判断有无当前用户信息
  const profile = await Profile.find({ user: id });
  if (profile.length > 0) {
    let nexExp = mapAttribute(arrExp, _body);

    profileFields.experience.unshift(nexExp);
    // update
    const profileUpdate = await Profile.update(
      { user: id },
      { $push: { experience: profileFields.experience } },
      { $sort: 1 }
    );

    /** 
     *  2019-6-24 犯错：添加的6项信息，只在数据库存了3项
     * 原因：model/Profile.js中将experience字段定义了两次，且内部字段不同，所以数据库只保存了两个字段共有的字段
     */

    if (profileUpdate.ok === 1) {
      let profile = await Profile.find({ user: id }).populate('users', ['name', 'avatar']);
      if (profile.length !== 0) {
        ctx.status = 200;
        ctx.body = profile;
      }
    }
  } else {
    error.noProfile = '没有该用户的信息';
    ctx.status = 404;
    ctx.body = error;
  }
});

/**
 * @route DELETE api/profile/experience?exp_id=shkdfh
 * @desc  删除experience接口地址
 * @access 接口是私密的
 */

router.delete('/experience', passport.authenticate('jwt', { session: false }), async ctx => {
  const { exp_id } = ctx.query;
  const { id } = ctx.state.user;  // 可以从token中获得user的信息

  //  找到user_id对应的账户信息里的experience
  let profile = await Profile.find({ user: id });
  let _experience = profile[0] !== undefined ? profile[0].experience : [];

  // 判断对experience的长度
  if (_experience.length !== 0) {
    // 通过遍历experience 删除exp_id对应的信息
    profile[0].experience = _experience.filter(item => item.id !== exp_id);

    // 更新删除后的experience到数据库
    let profileUpdate = await Profile.findOneAndUpdate(
      { user: id },
      { $set: profile[0] },
      { new: true }
    );
    if (profileUpdate.ok === 1) {
      ctx.status = 200;
      ctx.body = profileUpdate;
    }
  } else {
    ctx.status = 404;
    ctx.body = { msg: '没有找到对应的数据' };
  }
});

/**
 * @route POST api/profile/education
 * @desc  添加education接口地址
 * @access 接口是私密的
 */

router.post('/education', passport.authenticate('jwt', { session: false }), async ctx => {
  const _body = ctx.request.body;
  const { id } = ctx.state.user;  // 可以从token中获得user的信息

  // 检测用户输入信息是否合法
  const { errors, isValid } = validateEducationInput(_body);
  if (!isValid) {
    ctx.status = 400;
    ctx.body = errors;
    return;
  }

  const arrExp = ['current', 'school', 'degree', 'fieldofstudy', 'from', 'to', 'description'];

  let profileFields = {};
  let error = {};
  profileFields.education = [];

  // 判断有无当前用户信息
  const profile = await Profile.find({ user: id });
  if (profile.length > 0) {
    let nexExp = mapAttribute(arrExp, _body);

    profileFields.education.unshift(nexExp);
    // update
    const profileUpdate = await Profile.update(
      { user: id },
      { $push: { education: profileFields.education } },
      { $sort: 1 }
    );

    /** 
     *  2019-6-24 犯错：添加的6项信息，只在数据库存了3项
     * 原因：model/Profile.js中将experience字段定义了两次，且内部字段不同，所以数据库只保存了两个字段共有的字段
     */

    if (profileUpdate.ok === 1) {
      let profile = await Profile.find({ user: id }).populate('users', ['name', 'avatar']);
      if (profile.length !== 0) {
        ctx.status = 200;
        ctx.body = profile;
      }
    }
  } else {
    error.noProfile = '没有该用户的信息';
    ctx.status = 404;
    ctx.body = error;
  }
});

/**
 * @route DELETE api/profile/education?edu_id=snkdvlds
 * @desc  删除education接口地址
 * @access 接口是私密的
 */

router.delete('/education', passport.authenticate('jwt', { session: false }), async ctx => {
  const { edu_id } = ctx.query;
  const { id } = ctx.state.user;  // 可以从token中获得user的信息

  //  找到user_id对应的账户信息里的education
  let profile = await Profile.find({ user: id });
  let _education = profile[0] !== undefined ? profile[0].education : [];

  // 判断对experience的长度
  if (_education.length !== 0) {
    // 通过遍历experience 删除exp_id对应的信息
    profile[0].education = _education.filter(item => item.id === edu_id);

    // 更新删除后的experience到数据库
    let profileUpdate = await Profile.findOneAndUpdate(
      { user: id },
      { $set: profile[0] },
      { new: true }
    );
    if (profileUpdate.ok === 1) {
      ctx.status = 200;
      ctx.body = profileUpdate;
    }
  } else {
    ctx.status = 404;
    ctx.body = { msg: '没有找到对应的数据' };
  }
});

/**
 * @route DELETE api/profile
 * @desc  删除用户信息接口地址
 * @access 接口是私密的
 */

router.delete('/', passport.authenticate('jwt', { session: false }), async ctx => {
  const { id } = ctx.state.user;  // 可以从token中获得user的信息

  // 在Profile表中删除userId对应的信息
  let profile = await Profile.deleteOne({ user: id });
  if (profile.ok === 1) {
    // 在User表中删除userId对应的信息
    let user = await User.deleteOne({ _id: id });
    if (user.ok === 1) {
      ctx.status = 200;
      ctx.body = { success: true };
    }
  } else {
    ctx.status = 404;
    ctx.body = { error: 'profile不存在' };
  }
});

module.exports = router.routes();