/**
 * Created by linxiaojie on 2017/6/13.
 */
const Router = require('koa-router')
const router = new Router()
const UserDao = require('../dao/user')
const userDao = new UserDao()
const getNormalError = require('../error').getNormalError
const _ = require('lodash')
const useAuthor = require('../authorization')

router.param('user', async (id, cxt, next) => {
  const status = cxt.query['status'] === false || cxt.query['status'] === 'false' ? false : true
  let users = await userDao.findPopulate({
    queryParam: {
      _id: userDao.caseObjectId(id),
      status
    },
    populate: {
      path: 'roles',
      match: {status: true},
      /*      populate: {
       path: 'permissions',
       match: {status: true}
       }*/
    }
  })
  if (_.isEmpty(users)) {
    throw getNormalError('用户数据不存在，请检查')
  }
  cxt.user = users[0]
  return next()
})

/*
* 登录
* */
router.post('/login', async (cxt) => {
  const {loginName, password} = cxt.request.body || {loginName: '', password: ''}
  const message = '用户名或密码不正确'
  if (!loginName || !password) {
    throw getNormalError('登录用户名和密码不能为空')
  }
  let users = await userDao.find({loginName})
  if (users.length === 0) {
    throw getNormalError(message)
  }
  let user = users[0]
  let check = await user.comparePassword(password)
  if (check) {
    let token = await useAuthor.sign({
      loginName: user.loginName,
      loginTime: Date.now(),
      userName: user.userName
    })
    cxt.body = {
      token,
      message: '登录成功'
    }
  } else {
    throw getNormalError(message)
  }
})

/*
 * 增加
 * */
router.post('/', async (cxt) => {
  const body = cxt.request.body
  const user = await userDao.add(body)
  cxt.body = user
})

/*
 * 删除
 * */
router.del('/:id', async (cxt) => {
  const user = await userDao.delete({_id: userDao.caseObjectId(cxt.params.id)})
  cxt.body = {}
})

router.del('/batch/:ids', async (cxt) => {
  let ids = _.map((cxt.params.ids || '').split(','), (id) => {
    return userDao.caseObjectId(id)
  })
  const user = await userDao.delete({_id: {$in: ids}})
  cxt.body = {}
})

/*
 * 修改
 * */
router.put('/:user', async (cxt) => {
  const body = cxt.request.body
  const user = await userDao.update({_id: cxt.user._id}, body)
  cxt.body = {}
})

router.put('/batch/:ids', async (cxt) => {
  const body = cxt.request.body
  let ids = _.map((cxt.params.ids || '').split(','), (id) => {
    return userDao.caseObjectId(id)
  })
  const user = await userDao.update({_id: {$in: ids}}, body)
  cxt.body = {}
})

/*
 * 搜索
 * */
router.get('/', async (cxt) => {
  const queryParam = {}
  const name = cxt.query['name']
  const status = cxt.query['status'] === false || cxt.query['status'] === 'false' ? false : true
  queryParam.status = status
  if (name !== undefined) {
    queryParam.name = {$regex: decodeURIComponent(name)}
  }
  let list = await userDao.pageQuery({queryParam})
  cxt.body = list
})

/*
 * 获取详情
 * */
router.get('/:user', async (cxt) => {
  /*
  * 密码、盐值隐藏不显示
  * */
  cxt.user.password = ''
  cxt.user.salt = ''
  cxt.body = {
    user: cxt.user
  }
})


module.exports = router