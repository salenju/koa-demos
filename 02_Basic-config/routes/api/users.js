const Router = require('koa-router');
const router = new Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');  // 生成token的插件

const tools = require('../../config/tools');
const User = require('../../model/Users');  // 引入User
const Keys = require('../../config/keys');

/**
 * @route GET api/users/test
 * @desc  测试接口地址
 * @access 接口是公开的
 */
router.get('/test', async ctx => {
  ctx.status = 200;
  ctx.body = { msg: 'users works...' };
});

/**
 * @route POST api/users/register
 * @desc  注册接口地址
 * @access 接口是公开的
 */
router.post('/register', async ctx => {
  // 存储到数据库
  const _body = ctx.request.body;
  const findResult = await User.find({ email: _body.email });

  //  检测当前用户是否已注册
  if (findResult.length > 0) {
    ctx.status = 500;
    ctx.body = { email: ' 当前邮箱已被注册' };
  } else {
    /**
     * gravatar——全球公认图像
     * 如果已经在http://cn.gravatar.com注册并上传了自己的图像，则会自动获取你的图像，否则展示默认图像
     */
    const avatar = gravatar.url(_body.email, { s: '200', r: 'pg', d: 'mm' });
    const newUser = new User({
      name: _body.name,
      email: _body.email,
      avatar: avatar,
      password: tools.enbcrypt(_body.password)
    });
    // console.log(newUser);

    // 存储到数据库
    await newUser.save()
      .then(user => {
        ctx.body = user;
      })
      .catch(err => {
        console.log(err);
      })

    // 返回json数据
    ctx.body = newUser;
  }
});

/**
 * @route POST api/users/register
 * @desc  登录接口地址，返回token
 * @access 接口是公开的
 */
router.post('/login', async ctx => {
  const _body = ctx.request.body;
  // 查询当前登录用户是否已注册
  let findResult = await User.find({ email: _body.email });
  const user = findResult[0];
  const password = _body.password

  if (findResult.length == 0) {  // 没有查询到，即当前用户未注册
    ctx.status = 400;
    ctx.body = { msg: '该用户不存在' };
  } else {  // 查询到，验证密码
    let result = bcrypt.compareSync(password, user.password);

    // 验证通过
    if (result) {
      // 返回token
      const payload = { id: user.id, name: user.name, avatar: user.avatar };
      const token = jwt.sign(payload, Keys.secretOrKey, { expiresIn: 3600 });

      ctx.status = 200;
      ctx.body = { success: true, token: 'Bearer ' + token };
    } else {
      ctx.status = 400;
      ctx.body = { msg: '密码错误' };
    }
  }
});

/**
 * @route GET api/users/current
 * @desc  用户信息接口地址，返回用户信息
 * @access 接口是私密的
 */

module.exports = router.routes();