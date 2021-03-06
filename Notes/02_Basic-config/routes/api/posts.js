const Router = require('koa-router');
const router = new Router();
const passport = require('koa-passport');

const Post = require('../../model/Post');
const Profile = require('../../model/Profile');
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

/**
 * @route GET api/post/all
 * @desc  获取所有留言信息接口地址
 * @access 接口是公开的
 */
router.get('/all', async ctx => {
  await Post.find()
    .sort({ date: -1 })
    .then(posts => {
      ctx.status = 200;
      ctx.body = posts;
    })
    .catch(err => {
      ctx.status = 404;
      ctx.body = { mes: '没有找到留言信息' };
    })
});

/**
 * @route GET api/post?id=ashsdamsndfh
 * @desc  获取单个留言信息接口地址
 * @access 接口是公开的
 */
router.get('/', async ctx => {
  let id = ctx.query.id;
  await Post.findById(id)
    .then(post => {
      ctx.status = 200;
      ctx.body = post;
    })
    .catch(err => {
      ctx.status = 404;
      ctx.body = { msg: '没有找到对应的留言' };
    })
});

/**
 * @route DELETE api/post?post_id=ashsdamsndfh
 * @desc  删除单个留言信息接口地址
 * @access 接口是私有的
 */

router.delete('/', passport.authenticate('jwt', { session: false }), async ctx => {
  const { post_id } = ctx.query;
  const { id } = ctx.state.user;  // 可以从token中获得user的信息

  // 当前用户是否拥有个人信息(只有拥有个人信息的用户才有评论的权限)
  let profile = await profile.find({ user: id });
  if (profile.length !== 0) {
    //  查找当前post_id对应的留言信息
    let post = await Post.findById(post_id);
    // 当前post_id对应的留言信息是否是当前用户创建的
    if (post.user.toString() !== id) {
      ctx.status = 401;
      ctx.body = { notauthorized: '非法操作' };
      return;
    } else {
      // 数据库中删除post_id对应的评论
      await Post.remove({ _id: post_id })
        .then(post => {
          ctx.status = 200;
          ctx.body = post;
        })
        .catch(err => {
          ctx.status = 500;
          ctx.body = { error: '未能删除成功' };
        })
    }
  } else {
    ctx.status = 400;
    ctx.body = { msg: '未找到当前用户信息' };
  }
});

/**
 * @route POST api/post/like_unlike?post_id=ashsdamsndfh
 * @desc  点赞/取消点赞接口地址
 * @access 接口是私有的
 */

router.post('/like_unlike', passport.authenticate('jwt', { session: false }), async ctx => {
  const { post_id } = ctx.query;
  const { id } = ctx.state.user;  // 可以从token中获得user的信息

  // 当前用户是否拥有个人信息(只有拥有个人信息的用户才有评论的权限)
  let profile = await Profile.find({ user: id });
  if (profile.length !== 0) {
    //  查找当前post_id对应的留言信息
    let post = await Post.findById(post_id);
    // 当前post_id对应的留言信息中likes是否包含当前userId
    let tarIndex = post.likes.filter(item => item.user === id);

    //  当前userId是否已经点赞过
    if (tarIndex !== -1) {
      // 执行取消点赞操作
      post.likes = post.likes.splice(tarIndex, 1);
      let postUpdate = await Post.findOneAndUpdate(
        { _id: post_id },
        { $set: post },
        { new: true }
      );

      if (postUpdate.ok === 1) {
        ctx.status = 200;
        ctx.body = postUpdate;
      } else {
        ctx.status = 500;
        ctx.body = { error: '取消点赞失败' };
      }
    } else {
      // 执行点赞操作
      post.likes.unshit({
        user: id
      });
      let postUpdate = await Post.findOneAndUpdate(
        { _id: post_id },
        { $set: post },
        { new: true }
      );
      if (postUpdate.ok === 1) {
        ctx.status = 200;
        ctx.body = postUpdate;
      } else {
        ctx.status = 500;
        ctx.body = { error: '点赞失败' };
      }
    }

  } else {
    ctx.status = 400;
    ctx.body = { msg: '未找到当前用户信息' };
  }
});

/**
 * @route POST api/post/comment?post_id=ashsdamsndfh
 * @desc  评论接口地址
 * @access 接口是私有的
 */

router.post('/comment', passport.authenticate('jwt', { session: false }), async ctx => {
  const { post_id } = ctx.query;
  const { id } = ctx.state.user;  // 可以从token中获得user的信息
  const { text, avatar, name } = ctx.request.body;

  // 当前用户是否拥有个人信息(只有拥有个人信息的用户才有评论的权限)
  let profile = await Profile.find({ user: id });
  if (profile.length !== 0) {
    //  查找当前post_id对应的留言信息
    let post = await Post.findById(post_id);
    let newComment = {
      text: text,
      name: name,
      avatar: avatar,
      user: id
    };
    post.comments.unshit(newComment);
    let postUpdate = await Post.findOneAndUpdate(
      { _id: post_id },
      { $set: post },
      { new: true }
    );
    if (postUpdate.ok === 1) {
      ctx.status = 200;
      ctx.body = postUpdate;
    } else {
      ctx.status = 500;
      ctx.body = { error: '评论失败' };
    }
  } else {
    ctx.status = 404;
    ctx.body = { msg: '未找到当前用户信息' };
  }
});

/**
 * @route DELETE api/post/comment?post_id=ashsdamsndfh&comment_id=askgkd
 * @desc  删除评论接口地址
 * @access 接口是私有的
 */

router.delete('/comment', passport.authenticate('jwt', { session: false }), async ctx => {
  const { post_id, comment_id } = ctx.query;
  const { id } = ctx.state.user;  // 可以从token中获得user的信息

  // 当前用户是否拥有个人信息(只有拥有个人信息的用户才有评论的权限)
  let profile = await Profile.find({ user: id });
  if (profile.length !== 0) {
    //  查找当前post_id对应的留言信息
    let post = await Post.findById(post_id);
    let tarIndex = post.comments.filter(comment => comment._id === comment_id);
    if (tarIndex === -1) {
      ctx.status = 404;
      ctx.body = { msg: '未找对应的评论信息' };
      return;
    }

    if (post.comments[tarIndex]['user'] !== id) {
      ctx.status = 401;
      ctx.body = { msg: '没有删除该条评论的权限' };
      return;
    }

    post.comments.splice(tarIndex, 1);
    let postUpdate = await Post.findOneAndUpdate(
      { _id: post_id },
      { $set: post },
      { new: true }
    );

    if (postUpdate.ok === 1) {
      ctx.status = 200;
      ctx.body = postUpdate;
    } else {
      ctx.status = 500;
      ctx.body = { error: ' 删除评论失败' };
    }
  } else {
    ctx.status = 404;
    ctx.body = { msg: '未找到当前用户信息' };
  }
});

module.exports = router.routes();