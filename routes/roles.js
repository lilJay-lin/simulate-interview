/**
 * Created by linxiaojie on 2017/6/13.
 */
const Router = require('koa-router')
const router = new Router()
const RoleDao = require('../dao/role')
const roleDao = new RoleDao()
const getNormalError = require('../error').getNormalError
const _ = require('lodash')

router.param('role', async (id, cxt, next) => {
  const status = cxt.query['status'] == 0 ? 0 : 1
  let roles = await roleDao.findPopulate({
    queryParam: {
      _id: roleDao.caseObjectId(id),
      status
    },
    populate: {
      path: 'permissions',
      match: {status: true}
    }
  })
  if (_.isEmpty(roles)) {
    throw getNormalError('角色数据不存在，请检查')
  }
  cxt.role = roles[0]
  return next()
})

/*
* 增加
* */
router.post('/', async (cxt) => {
  const body = cxt.request.body
  const role = await roleDao.add(body)
  cxt.body = role
})

/*
 * 删除
 * */
router.del('/:id', async (cxt) => {
  const role = await roleDao.delete({_id: roleDao.caseObjectId(cxt.params.id)})
  cxt.body = {}
})

router.del('/batch/:ids', async (cxt) => {
  let ids = _.map((cxt.params.ids || '').split(','), (id) => {
    return roleDao.caseObjectId(id)
  })
  const role = await roleDao.delete({_id: {$in: ids}})
  cxt.body = {}
})

/*
* 修改
* */
router.put('/:role', async (cxt) => {
  const body = cxt.request.body
  const role = await roleDao.update({_id: cxt.role._id}, body)
  cxt.body = {}
})

router.put('/batch/:ids', async (cxt) => {
  const body = cxt.request.body
  let ids = _.map((cxt.params.ids || '').split(','), (id) => {
    return roleDao.caseObjectId(id)
  })
  const role = await roleDao.update({_id: {$in: ids}}, body)
  cxt.body = {}
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
  let list = await roleDao.pageQuery({pageSize: query.pageSize, page: query.page, queryParam})
  cxt.body = list
})

/*
* 获取详情
* */
router.get('/:role', async (cxt) => {
  cxt.body = {
    role: cxt.role
  }
})


module.exports = router