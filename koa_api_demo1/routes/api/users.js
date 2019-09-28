const Router = require('koa-router');

const router = new Router();

// 引入User Model
const userModel = require('../../models/userModel')

/**
 * @route GET api/users/test
 * @desc 测试接口地址
 * @access 公开接口
 */
router.get('/test', async ctx => {
  ctx.status = 200;
  ctx.body = {
    msg: 'users working...'
  };
});

module.exports = router.routes();