const Router = require('koa-router');
const router = new Router();
const passport = require('koa-passport');

const Profile = require('../../model/Profile');

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
  console.log(Array.isArray(itemArr))
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
  const { id } = ctx.state.user;  // 可以从token中获得user的信息
  const arr = ['handle', 'company', 'website', 'location', 'status', 'skills', 'bio', 'githubusername'];
  let profileFields = {};

  if (id) {
    profileFields.user = id;
  }

  Object.assign(profileFields, mapAttribute(arr, ctx.request.body));

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



module.exports = router.routes();