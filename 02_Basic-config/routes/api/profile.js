const Router = require('koa-router');
const router = new Router();
const passport = require('koa-passport');

const Profile = require('../../model/Profile');
const validateProfileInput = require('../../validation/profile');

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
   * Profile.find({user:id}).populate('user',['name','avatar'])
   *  Profile.find({user:id})——在Profile表中通过user:id来查找对应的用户
   *  populate('user',['name','avatar'])——关联user表，查找name,avatar字段
   */
  const profile = await Profile.find({ user: id }).populate('user', ['name', 'avatar']);

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

  let profile = await Profile.find({handle:handle}).populate('user',['name','avatar']);
  if(profile.length === 0) {
    errors.noProfile = '未找到用户信息';
    ctx.status = 404;
    ctx.body = errors;
  }else {
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

  let profile = await Profile.find({user:user_id}).populate('user',['name','avatar']);
  if(profile.length === 0) {
    errors.noProfile = '未找到用户信息';
    ctx.status = 404;
    ctx.body = errors;
  }else {
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

  let profiles = await Profile.find({}).populate('user',['name','avatar']);
  if(profiles.length === 0) {
    errors.noProfile = '没有找到任何用户信息';
    ctx.status = 404;
    ctx.body = errors;
  }else {
    ctx.status = 200;
    ctx.body = profiles;
  }
});

module.exports = router.routes();