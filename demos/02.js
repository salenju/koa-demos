const Koa = require('koa');
const app = new Koa();

// 设置ctx.response.body
const main = ctx => {
  ctx.response.body = 'Hello World';
};

app.use(main);  // 利用app.use()方法加载main函数
app.listen(3000);