/* 中间件 */

const route = require('koa-route');
const path = require('path');
const serve = require('koa-static');
const Koa = require('koa');
const app = new Koa();

// 中间件——middleware
const logger = (ctx,next) => {
  console.log(`${Date.now()}${ctx.request.method}${ctx.request.url}`);
  next();
};

app.use(logger);
app.listen(3000);
