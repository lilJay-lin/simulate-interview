/**
 * Created by linxiaojie on 2017/6/13.
 */
const Koa = require('koa')
const mongoose = require('./mongoose')
const createLogger = require('concurrency-logger').default
const app = new Koa()
const router = require('./routes')
const path = require('path')
const bodyParser = require('koa-bodyparser')
const error = require('./error')

/*
* 连接数据库
* */
app.use(mongoose({
  host: '127.0.0.1',
  port: 27017,
  database: 'simulate',
  schemas: path.join(__dirname, 'schemas'),
  opt: {
    user: 'xmb',
    pass: '20160924_jy',
    db: {
      native_parser: true
    },
    server: {
      poolSize: 5
    }
  }
}))

/*
* 请求数据转换
* */
app.use(bodyParser())

/*
* 添加日志
* */
let logger = createLogger({
  getLevel: (responseTime, context) => {
    /*
     GET
     0 -  99ms: 0
     100 - 149ms: 1
     150 - 199ms: 2
     200 - 249ms: 3
     250 - 299ms: 4
     300 - 349ms: 5
     > 350ms    : 6

     POST
     0 - 149ms: 0
     150 - 225ms: 1
     ... : ...
     */
    let threshold = 50; // ms
    if (['POST', 'PUT'].includes(context.method)) {
      threshold *= 1.5;
    }
    return Math.floor(responseTime / threshold) - 1;
  }
})
app.use(logger)

/*
*  异常处理
*/
app.use(error())

/*
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})
*/

app.use(router.routes())
   .use(router.allowedMethods())

app.listen(3000)