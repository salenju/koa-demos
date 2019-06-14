/* koa-route模块 */

const Koa = require('koa');
const route = require('koa-route');
const app = new Koa();

const about = ctx => {
  ctx.response.type = 'html';
  ctx.response.body = '<p>About us</p>';
};

const main = ctx => {
  ctx.response.body = 'Hello World';
};

app.use(route.get('/',main));
app.use(route.get('/about',about));
app.listen(3000);
