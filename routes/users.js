/**
 * Created by linxiaojie on 2017/6/13.
 */
const Router = require('koa-router')
const router = new Router()
const UserDao = require('../dao/user')
const userDao = new UserDao()

router.post('/', async (cxt) => {
  const body = cxt.request.body
  const user = await userDao.add(body)
  cxt.body = user
})

router.get('/', async (cxt) => {
  let list = await userDao.pageQuery({pageSize: 2, userName: {$regex: '林'}})
  cxt.body = list
})


module.exports = router