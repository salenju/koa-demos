const Koa = require('koa');
const Json = require('koa-json');
const Router = require('koa-router');
const render = require('koa-ejs');
const path = require('path');

// 实例化koa
const app = new Koa();
const router = new Router();

// json pretty
app.use(Json());

// 配置路由模块
app.use(router.routes())
  .use(router.allowedMethods())

// 配置模板引擎
render(app, {
  root: path.join(__dirname, 'views'),
  layout: 'layout',
  viewExt: 'html',
  cache: false,
  debug: false,
});

// 配置路由跳转
router.get('/add', ctx => (ctx.body = 'Hello Router!'))
router.get('/', async ctx => {
  await ctx.render('index', {
    title: 'I love China'
  })
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log('Server Started...'));