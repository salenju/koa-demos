const Router = require('koa-router');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('koa-passport');
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

const router = new Router();

// 引入User Model
const userModel = require('../../models/userModel')

// 引入工具函数
const tools = require('../../config/tools');

/**
 * @route GET api/users/test
 * @desc 测试接口
 * @access 公开接口
 */
router.get('/test', async ctx => {
  ctx.status = 200;
  ctx.body = {
    msg: 'users working...'
  };
});

/**
 * @route POST api/users/register
 * @desc 用户注册接口
 * @access 公开接口
 */
router.post('/register', async ctx => {
  const _body = ctx.request.body;

  // 验证注册信息
  const { errors, isValid } = validateRegisterInput(ctx.request.body)
  if (!isValid) {
    ctx.status = 400;
    ctx.body = {
      status: 'F',
      errMsg: errors,
      data: ''
    }
    return;
  }

  //  存储数据到数据库
  const findResult = await userModel.find({ email: _body.email });
  if (findResult.length > 0) {  // 该邮箱已注册
    ctx.status = 500;
    ctx.body = {
      status: 'F',
      errMsg: '该邮箱已经注册',
      data: ''
    }
  } else { // 该邮箱未注册
    // 将新注册信息存储到数据库中
    let newUser = new userModel({
      name: _body.name,
      email: _body.email,
      password: tools.encryptPwd(_body.password)
    });
    await newUser.save()
      .then(res => {
        ctx.status = 200;
        // ctx.body = {
        //   status: 'S',
        //   errMsg: '',
        //   data: ''
        // }
        ctx.body = res  // For test
      })
      .catch(err => console.log(err))
  }
});

/**
 * @route POST api/users/login
 * @desc 用户登录接口
 * @access 公开接口
 */
router.post('/login', async ctx => {
  const _body = ctx.request.body;

  // 验证登录
  const { errors, isValid } = validateLoginInput(ctx.request.body);
  if (!isValid) {
    ctx.status = 400;
    ctx.body = {
      status: 'F',
      errMsg: errors,
      data: ''
    };
    return;
  }

  // 通过输入的email查找用户 
  let findResult = await userModel.find({ email: _body.email });
  let findUserInfo = findResult[0];

  // 用户存在
  if (findUserInfo) {
    // 比较输入密码和DB中的密码是否一致
    let pwdSame = await bcrypt.compareSync(_body.password, findUserInfo.password);
    if (pwdSame) {
      // 生成token
      let payload = { id: findUserInfo.id, name: findUserInfo.name, avatar: findUserInfo.avatar };
      let token = jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 });

      ctx.status = 200;
      ctx.body = {
        status: 'S',
        errMsg: '',
        data: `Bearer ${token}`
      };
    } else {
      ctx.status = 400;
      ctx.body = {
        status: 'F',
        errMsg: '密码错误',
        data: ''
      };
    }
  } else {  // 用户不存在
    ctx.status = 404;
    ctx.body = {
      status: 'F',
      errMsg: '该用户不存在',
      data: ''
    };
  }
});

/**
 * @route POST api/users/current
 * @desc 用户信息接口，返回用户信息
 * @access 私密接口
 */
router.get('/current', passport.authenticate('jwt', { session: false }), async ctx => {
  // console.log('===>ctx:',ctx.state.user)

  const { id, name, email } = ctx.state.user;
  ctx.status = 200;
  ctx.body = {
    status: 'S',
    errMsg: '',
    data: {
      id: id,
      name: name,
      email: email
    }
  }
});

module.exports = router.routes();