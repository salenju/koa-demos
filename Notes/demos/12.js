/* 静态资源 */

const route = require('koa-route');
const path = require('path');
const serve = require('koa-static');
const Koa = require('koa');
const app = new Koa();

const main = serve(path.join(__dirname));

app.use(main);
app.listen(3000);
