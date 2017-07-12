/**
 * Created by linxiaojie on 2017/7/5.
 */
const jwt = require('koa-jwt')
const jsonWebToken = require('jsonwebtoken')
const SECRET = 'simulate-interview-liljay-secret'
const TOKEN_KEY = 'token'
const unlessPaths = [/^\/api\/users\/login/, /^\/api\/wx/]
const redis = require('../redis')

module.exports.userAuthor = () => {
  return jwt({
    secret: SECRET,
    tokenKey: TOKEN_KEY, /*cxt.state.token*/
    getToken (ctx) {
      let req = ctx.request
      return (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token']
    },
    /*
     * token 是否失效
     * */
    isRevoked (cxt, decodeToken, token) {
      return redis.get(token).then((val) => {
        return val !== null
      }).catch((err) => {
        cxt.log(err)
        return true
      })
    },
    debug: true
  }).unless({path: unlessPaths})
}

module.exports.revoked = (token) => {
  return redis.set(token, '1')
}

module.exports.sign = (payload = {}) => {
  return new Promise((resolve, reject) => {
    const now = Math.floor(Date.now() / 1000)
    /*
    * timestamp
    * */
    payload.iat = now - 30
    /*
    * expire time
    * 半个钟有效
    * */
    payload.exp = now + 60 * 60 / 2
    jsonWebToken.sign(payload, SECRET,  {algorithm: 'HS256'}, function (err, token) {
      if (err) {
        reject(err)
        return
      }
      resolve(token)
    })
  }).catch((err) => {
    throw err
  })
}