const Koa = require('koa');
const Json = require('koa-json');
const Router = require('koa-router');
const mongoose = require('mongoose');
const bodyParser = require('koa-bodyparser');

// 实例化koa
const app = new Koa();
const router = new Router();

// json pretty
app.use(Json());

// 解析请求体
app.use(bodyParser());

// 配置路由模块
app.use(router.routes())
  .use(router.allowedMethods())

// 配置路由地址
const users = require('./routes/api/users');

/**
 * http://localhost:5000/api/users/
 * 只要是包含上面的url就会跳转到users.js文件中进行路由的处理
 * eg:http://localhost:5000/api/users/test
 * 
 */
router.use('api/users', users);

// 连接DB
const db = require('./config/keys').mogoURI;  // 引入DB
mongoose.connect(db, { useNewUrlParser: true })
  .then(() => console.log('Mongodb connected...'))
  .catch(err => console.log(err))

// const port = process.env.PORT || 5000;
const port = 5000;

app.listen(port, () => console.log('Server Started...'));