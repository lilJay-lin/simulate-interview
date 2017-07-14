/**
 * Created by linxiaojie on 2017/7/11.
 */
const Router = require('koa-router')
const router = new Router()
const api = require('../dao/wx')

/*
* 微信jssdk服务器验证
* */
router.get('/', api.wechat.middleware(() => {}))

/*
* 微信消息请求服务
* */
router.post('/', api.wechat.middleware(async (message) => {
  const fromUserName = message.FromUserName
  return 'Hello world!'
}))

/*
*
* */

module.exports = router