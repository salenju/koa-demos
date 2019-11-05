const Router = require('koa-router');
const passport = require('koa-passport');

const router = new Router();
const profileModel = require('../../models/profileModel');
const userModel = require('../../models/userModel');
const validateProfileInput = require('../../validation/profile');

/* =========================== 公共方法 =========================== */
const mapAttribute = (arr, obj) => {
  let tarResult = {}
  if (Array.isArray(arr) && arr.length !== 0) {
    arr.map(item => {
      obj[item]
        ? tarResult[item] = obj[item]
        : null
    })
  }
  return tarResult;
};

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
 * @desc  个人信息接口
 * @access 私密接口
 */
router.get('/', passport.authenticate('jwt', { session: false }), async ctx => {
  const { id } = ctx.state.user;  // 可以从token中获得user的信息

  /**
 *  profileModel.find({user:id}).populate('user',['name','avatar'])
 *  profileModel.find({user:id})——在profileModel表中通过user:id来查找对应的用户
 *  populate('user',['name','avatar'])——关联user表，查找name,avatar字段,并join到查询到的user字段中
 * 
 *  《Mongoose 之 Population 使用》 https://segmentfault.com/a/1190000002727265
 */
  let profile = await profileModel.find({ user: id }).populate('user', ['name', 'avatar']);
  if (profile.length > 0) {
    ctx.status = 200;
    ctx.body = {
      status: 'S',
      errMsg: '',
      data: profile[0]
    }
  } else {
    ctx.status = 404;
    ctx.body = {
      status: 'F',
      errMsg: '未查询到该用户的信息',
      data: ''
    }
  }
});

/**
 * @route POST api/profile
 * @desc   添加/修改个人信息接口
 * @access 私密接口
 */
router.post('/', passport.authenticate('jwt', { session: false }), async ctx => {
  const _body = ctx.request.body;
  const { id } = ctx.state.user;   // 从token中获取user id

  // 校验输入是否合法
  const { errors, isValid } = validateProfileInput(_body);
  if (!isValid) {
    ctx.status = 400;
    ctx.body = {
      status: 'F',
      errMsg: errors,
      data: ''
    }
  }

  const arr = ['handle', 'company', 'website', 'location', 'status', 'skills', 'bio', 'githubusername'];
  const arrSocial = ['wechat', 'QQ', 'tengxunkt', 'wangyikt'];

  let profileFields = {};
  id ? profileFields.user = id : null;
  profileFields.social = mapAttribute(arrSocial, _body);
  Object.assign(profileFields, mapAttribute(arr, _body));

  // 当前user id是否存在于DB中
  let profile = await profileModel.find({ user: id });
  if (profile.length > 0) {
    // 存在则update
    await profileModel.findOneAndUpdate(
      { user: id },
      { $set: profileFields },
      { new: true }
    )
    ctx.status = 200;
    ctx.body = {
      status: 'S',
      errMsg: '',
      data: profileFields
    }
  } else {
    // 不存在则add到数据库
    await new profileModel(profileFields).save()
      .then(profile => {
        ctx.status = 200;
        ctx.body = {
          status: 'S',
          errMsg: '',
          data: profile
        }
      });
  }
});

/**
 * @route DELETE api/profile
 * @desc   删除个人信息接口
 * @access 私密接口
 */
router.delete('/', passport.authenticate('jwt', { session: false }), async ctx => {
  const { id } = ctx.state.user;  // 从koken中获取user id

  // 删除profileModel中的userId对应的信息
  let profile = await profileModel.deleteOne({ user: id });
  if (profile.ok === 1) {
    // 删除userModel中的userId对应的信息
    let user = await userModel.deleteOne({ _id: id });
    if (user.ok === 1) {
      ctx.status = 200;
      ctx.body = {
        status: 'S',
        errMsg: '',
        data: ''
      }
    }
  } else {
    ctx.status = 404;
    ctx.body = {
      status: 'F',
      errMsg: 'profile不存在',
      data: ''
    }
  }
});

/* ============================================ 获取用户信息API Start============================================ */
/**
 * @route  GET api/profile/handle?handle=test
 * @desc   获取用户信息（handle）
 * @access 公开接口
 */
router.get('/handle', async ctx => {
  const { handle } = ctx.query;
  let errors = {};

  let profile = await profileModel.find({ handle: handle }).populate('user', ['name', 'avatar']);
  if (profile.length === 0) {
    ctx.status = 404;
    ctx.body = {
      status: 'F',
      errMsg: errors,
      data: ''
    }
  } else {
    ctx.status = 200;
    ctx.body = {
      status: 'S',
      errMsg: '',
      data: profile[0]
    }
  }
});

/**
 * @route  GET api/profile/user_id?user_id=test
 * @desc   获取用户信息（user_id）
 * @access 公开接口
 */
router.get('/user_id', async ctx => {
  const { user_id } = ctx.query;
  let errors = {};

  let profile = await profileModel.find({ user: user_id }).populate('user', ['name', 'avatar']);
  if (profile.length === 0) {
    ctx.status = 404;
    ctx.body = {
      status: 'F',
      errMsg: errors,
      data: ''
    }
  } else {
    ctx.status = 200;
    ctx.body = {
      status: 'S',
      errMsg: '',
      data: profile[0]
    }
  }
});

/**
 * @route  GET api/profile/all
 * @desc   获取所有用户信息
 * @access 公开接口
 */
router.get('/all', async ctx => {
  let errors = {};

  let profile = await profileModel.find({}).populate('user', ['name', 'avatar']);
  if (profile.length === 0) {
    ctx.status = 404;
    ctx.body = {
      status: 'F',
      errMsg: errors,
      data: ''
    }
  } else {
    ctx.status = 200;
    ctx.body = {
      status: 'S',
      errMsg: '',
      data: profile[0]
    }
  }
});
/* ============================================ 获取用户信息API End============================================ */

/* ============================================ experience & education API Start============================================ */
/**
 * @route   POST api/profile/experience
 * @desc   添加experience
 * @access 私密接口
 */
router.post('/experience', passport.authenticate('jwt', { session: false }), async ctx => {
  const _body = ctx.request.body;
  const { id } = ctx.state.user;
  let experienceArr = ['title', 'current', 'company', 'location', 'from', 'to', 'description'];

  // 检测输入是否合法

  // 查找用户是否存在
  const profile = await profileModel.find({ user: id });
  if (profile.length > 0) {
    let nexExp = mapAttribute(experienceArr, _body);
    let _experience = [];
    _experience.unshift(nexExp);

    // 更新内容
    const profileUpdate = await profileModel.update(
      { uesr: id },
      { $push: { experience: _experience } },
      { $sort: 1 }
    );

    if (profileUpdate.ok === 1) {
      let profile = await profileModel.find({ user: id }).populate('user', ['name', 'avatar']);
      if (profile.length !== 0) {
        ctx.status = 200;
        ctx.body = {
          status: 'S',
          errMsg: '',
          data: profile
        }
      }
    }
  } else {
    ctx.status = 404;
    ctx.body = {
      status: 'F',
      errMsg: '没有该用户的信息',
      data: ''
    }
  }
});

/**
 * @route   DELETE api/profile/experience?exp_id=knsdh
 * @desc   删除experience
 * @access 私密接口
 */
router.delete('/experience', passport.authenticate('jwt', { session: fasle }), async ctx => {
  const { exp_id } = ctx.query;
  const { id } = ctx.state.user;

  //  找到user_id对应的账户信息里的experience
  let profile = await profileModel.find({ user: id });
  let _experience = profile[0] !== undefined ? profile[0].experience : [];

  // 判断experience是否为空
  if (_experience.length !== 0) {
    //  删除exp_id对应的experience信息
    profile[0].experience = profile[0].experience.filter(item => item.id !== exp_id)

    // update删除后的expericence信息
    let profileUpdate = await profileModel.findOneAndUpdate(
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
    ctx.body = {
      status: 'F',
      errMsg: '没有该用户的信息',
      data: ''
    }
  }
});

/**
 * @route   POST api/profile/education
 * @desc   添加education
 * @access 私密接口
 */

router.post('/education');

/**
 * @route   DELETE api/profile/education?edu_id = slhdkj
 * @desc   删除education
 * @access 私密接口
 */
router.delete('/education');

/* ============================================ experience &education API End============================================ */

module.exports = router.routes();