const koa = require('koa');
const Router = require('koa-router');
const mongoose = require('mongoose');
const bodyParser = require('koa-bodyparser');
const passport = require('koa-passport');   // 验证token

// 实例化
const app = new koa();
const router = new Router();

// 引入db
const db = require('./config/keys').mongoURI;

// 引入users.js & profile.js
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');

app.use(bodyParser());  //  此处需放在配置路由之前，否则会有异常

// 配置passport
app.use(passport.initialize());
app.use(passport.session());

// 将passport回调到config文件中的 passport.js
require('./config/passport')(passport);

// 配置路由
app.use(router.routes())
  .use(router.allowedMethods());

// 配置路由地址
/**
 * http://localhost:5000/api/users/
 * 只要是包含上面的url就会跳转到users.js文件中进行路由的处理
 * eg:http://localhost:5000/api/users/test
 * 
 */
router.use('/api/users', users);
router.use('/api/profile', profile);

// 连接数据库
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log('Mongodb connected...'))
  .catch(err => console.log(err))


// 路由
router.get('/', async ctx => {
  ctx.body = { msg: 'Hello interface' };
});

// 设置端口
const port = process.env.PORT || 5000;

// 监听端口
app.listen(port, () => {
  console.log(`server start on ${port}`);
});