/**
 * Created by linxiaojie on 2017/7/11.
 */
const Router = require('koa-router')
const router = new Router()
const weChat = require('co-wechat')
const config = {
  token: '324sfsrw3423sdfsssxxx',
  appid: 'wxe7c8f122ea49edef',
  checkSignature: false
}

/*
* 微信jssdk服务器验证
* */
router.get('/', weChat(config).middleware(() => {}))

module.exports = router