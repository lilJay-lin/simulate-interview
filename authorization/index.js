/**
 * Created by linxiaojie on 2017/7/5.
 */
const jwt = require('koa-jwt')
const jsonWebToken = require('jsonwebtoken')
const SECRET = 'simulate-interview-liljay-secret'
const TOKEN_KEY = 'token'
const unlessPaths = [/^\/api\/users\/login/]

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
      return false
    },
    debug: false
  }).unless({path: unlessPaths})
}

module.exports.sign = (payload = {}) => {
  return new Promise((resolve, reject) => {
    payload.iat = Math.floor(Date.now() / 1000) - 30
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