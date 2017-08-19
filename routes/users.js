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
const auth = require('../authorization/req_auth').auth
const CODES = require('../authorization/req_auth').CODES

router.param('user', async (id, cxt, next) => {
  const status = cxt.query['status'] == 0 ? 0 : 1
  let users = await userDao.findPopulate({
    queryParam: {
      _id: userDao.caseObjectId(id),
      status
    },
    populate: {
      path: 'roles',
      match: {status: '1'},
      /*      populate: {
       path: 'permissions',
       match: {status: true}
       }*/
    }
  })
  if (_.isEmpty(users)) {
    throw getNormalError('用户数据不存在，请检查')
  }
  cxt.user = users[0].toObject()
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
    let payload = await userDao.getFullUserWithPermission(user._id)
    /*
    * 不保存角色
    * */
    delete payload.roles
    let token = await useAuthor.sign(payload)
    cxt.body = {
      token,
      message: '登录成功'
    }
  } else {
    throw getNormalError(message)
  }
})

/*
* 注销
* */
router.get('/logout', async (cxt) => {
  let status = await useAuthor.revoked(cxt.state.token)
  if (!status) {
    throw new Error('注销失败，请重试')
  }
  cxt.body = {message: '注销成功'}
})

/*
 * 获取当前登录用户详情
 * */
router.get('/info', async (cxt) => {
  let user = await userDao.getFullUserWithPermission(userDao.caseObjectId(cxt.state.user._id))
  cxt.body = {
    user
  }
})


/*
 * 搜索
 * */
router.get('/', async (cxt) => {
  const queryParam = {}
  const query = cxt.query
  const name = query['name']
  const status = query['status'] == 0 ? 0 : 1
  queryParam.status = status
  if (name !== undefined) {
    queryParam.name = {$regex: decodeURIComponent(name)}
  }
  let list = await userDao.pageQuery({pageSize: query.pageSize, page: query.page, queryParam})
  cxt.body = list
})

/*
 * 获取详情
 * */
router.get('/:user', async (cxt) => {
  /*
   * 密码、盐值隐藏不显示
   * */
  /*  cxt.user.password = ''
   cxt.user.salt = ''*/
  cxt.body = {
    user: cxt.user
  }
})

/*
 * 非查询功能权限限制
 * */
router.use(auth([CODES.manageUser]))

/*
 * 增加
 * */
router.post('/', async (cxt) => {
  const body = cxt.request.body
  const user = await userDao.add(body)
  cxt.body = {}
})

/*
 * 删除
 * */

router.del('/batch/:ids', async (cxt) => {
  const body = cxt.request.body
  let ids = _.map((cxt.params.ids || '').split(','), (id) => {
    return userDao.caseObjectId(id)
  })
  const user = await userDao.batch({_id: {$in: ids}}, body)
  cxt.body = {}
})

/*
 * 修改
 * */
router.put('/:user', async (cxt) => {
  const body = cxt.request.body
  /*
  * 防止被更新覆盖，密码修改通过另一个单独接口做修改，只能本人做修改
  * */
  delete body.password
  delete body.salt
  const user = await userDao.update({_id: cxt.user._id}, body)
  cxt.body = {}
})

router.put('/batch/:ids', async (cxt) => {
  const body = cxt.request.body
  /*
   * 防止被更新覆盖，密码修改通过另一个单独接口做修改，只能本人做修改
   * */
  delete body.password
  delete body.salt
  let ids = _.map((cxt.params.ids || '').split(','), (id) => {
    return userDao.caseObjectId(id)
  })
  const user = await userDao.update({_id: {$in: ids}}, body)
  cxt.body = {}
})

/*
* 修改密码
* */
router.put('/password', async (cxt) => {
  const {password = null} = cxt.request.body
  await userDao.update({_id: cxt.state.user._id}, {password})
  cxt.body = {}
})
module.exports = router