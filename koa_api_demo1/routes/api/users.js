const Router = require('koa-router');

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
 * @route POST api/users/register
 * @desc 用户注册接口
 * @access 公开接口
 */



module.exports = router.routes();