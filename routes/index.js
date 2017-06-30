/**
 * Created by linxiaojie on 2017/6/13.
 */
const Router = require('koa-router')
const router = new Router({
  prefix: '/users'
})
const UserDao = require('../dao/user')

router.post('/', async (cxt) => {
  const body = cxt.request.body
  const user = await UserDao.addUser(body)
  cxt.body = user
})

router.get('/', async (cxt) => {
  let list = await UserDao.findUser({userName: {$regex: '林'}})
  cxt.body = list
})


module.exports = router