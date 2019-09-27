const Koa = require('koa');
const json = require('koa-json');
const KoaRouter = require('koa-router');
const path = require('path');
const render = require('koa-ejs');  // 模板引擎
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new KoaRouter();

app.use(json());  // 格式换json数据
app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());  // 配置路由模块

// Mock数据
let things = ['salen', 'hellen', 'lemmon'];

// 配置模板引擎
render(app, {
  root: path.join(__dirname, 'views'),  // __dirname为app.js的路径
  layout: 'layout',
  viewExt: 'html',
  cache: false,
  debug: false
});

// 路由跳转 
router.get('/', index);

async function index(ctx) {
  await ctx.render('index', {
    title: 'Hello Salen...',
    things: things
  });
}

// 路由跳转 "/add" 
router.get('/add', showAdd);

async function showAdd(ctx) {
  await ctx.render('add');
}

// 添加路由方法
router.post('/add', add);

async function add(ctx) {
  const body = ctx.request.body;
  things.push(body.thing);
  ctx.redirect('/');
}

router.get('/test/:id', ctx => (ctx.body = `Hello ${ctx.params.id}`))

app.listen(3000, () => console.log('Start...'));