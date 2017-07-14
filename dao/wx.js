/**
 * Created by linxiaojie on 2017/7/14.
 */
const WeChatApi = require('co-wechat-api')
const weChat = require('co-wechat')
const redis = require('../redis')
const ACCESS_TOKEN = 'access_token'
const JS_API_TICKET = 'js_api_ticket'

const config = {
  token: '324sfsrw3423sdfsssxxx',
  appid: 'wxe7c8f122ea49edef',
  appsecret: 'd61df4adaeae4b84c3e787307b26b425',
  checkSignature: false
}

WeChatApi.mixin({
  wechat: weChat(config)
})

const api = new WeChatApi(config.appid, config.appsecret, async () => {
  let token = await redis.get(ACCESS_TOKEN)
  return JSON.parse(token)
}, async (token) => {
  await redis.set(ACCESS_TOKEN, JSON.stringify(token))
})

/*
* 设置jssdk ticket 保存和共享方式
* */
api.registerTicketHandle(async () => {
  let token = await redis.get(JS_API_TICKET)
  return JSON.parse(token)
}, async (token) => {
  await redis.set(JS_API_TICKET, JSON.stringify(token))
})

module.exports = api