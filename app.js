const Koa = require('koa');
const json = require('koa-json');
const KoaRouter = require('koa-router');
const path = require('path');
const render = require('koa-ejs');  // 模板引擎

const app = new Koa();
const router = new KoaRouter();

// 格式换json数据
app.use(json());

// Mock数据
let things  = ['salen','hellen','lemmon'];

// 配置路由模块
app.use(router.routes()).use(router.allowedMethods())

// 配置模板殷引擎
render(app,{
  root:path.join(__dirname,'views'),  // __dirname为app.js的路径
  layout:'layout',
  viewExt:'html',
  cache:false,
  debug:false
});

// 路由跳转 index
router.get('/index',async ctx => {
  await ctx.render('index',{
    title:'Hello Salen...',
    things:things
  });
});

app.listen(3000, () => console.log('Start...'));