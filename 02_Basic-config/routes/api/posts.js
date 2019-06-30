const Router = require('koa-router');
const router = new Router();
const passport = require('koa-passport');

const Post = require('../../model/Post');
const validatePostInput = require('../../validation/post');

/**
 * @route GET api/post/test
 * @desc  测试接口地址
 * @access 接口是公开的
 */
router.get('/test', async ctx => {
  ctx.status = 200;
  ctx.body = { msg: 'posts works...' };
});

/**
 * @route POST api/posts
 * @desc  创建留言接口地址
 * @access 接口是私密的
 */

router.post('/', passport.authenticate('jwt', { session: false }), async ctx => {
  const _body = ctx.request.body;
  const { id } = ctx.state.user;  // 可以从token中获得user的信息

  // 检测用户输入信息是否合法
  const { errors, isValid } = validatePostInput(_body);
  if (!isValid) {
    ctx.status = 400;
    ctx.body = errors;
    return;
  }

  let newPost = new Post({
    text: _body.text,
    name: _body.name,
    avatar: _body.avatar,
    user: _body.user.id
  });

  await newPost.save()
    .then(post => ctx.body = post)
    .catch(err => ctx.body = err)

  ctx.body = newPost;
});



module.exports = router.routes();