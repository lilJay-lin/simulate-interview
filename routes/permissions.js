/**
 * Created by linxiaojie on 2017/6/13.
 */
const Router = require('koa-router')
const router = new Router()
const PermissionDao = require('../dao/permission')
const permissionDao = new PermissionDao()
const getNormalError = require('../error').getNormalError
const _ = require('lodash')
const auth = require('../authorization/req_auth').auth
const CODES = require('../authorization/req_auth').CODES

router.param('permission', async (id, cxt, next) => {
  const status = cxt.query['status'] == 0 ? 0 : 1
  let permissions = await permissionDao.find({_id: permissionDao.caseObjectId(id), status})
  if (_.isEmpty(permissions)) {
    throw getNormalError('权限数据不存在，请检查')
  }
  cxt.permission = permissions[0]
  return next()
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
  let list = await permissionDao.pageQuery({pageSize: query.pageSize, page: query.page, queryParam})
  cxt.body = list
})

/*
 * 获取详情
 * */
router.get('/:permission', async (cxt) => {
  cxt.body = {
    permission: cxt.permission
  }
})

/*
* 非查询功能权限限制
* */
router.use(auth([CODES.managePermission]))

/*
* 增加
* */
router.post('/', async (cxt) => {
  const body = cxt.request.body
  const permission = await permissionDao.add(body)
  cxt.body = {}
})

/*
 * 删除
 * */
router.del('/batch/:ids', async (cxt) => {
  const body = cxt.request.body
  let ids = _.map((cxt.params.ids || '').split(','), (id) => {
    return permissionDao.caseObjectId(id)
  })
  const permission = await permissionDao.batch({_id: {$in: ids}}, body)
  cxt.body = {}
})

/*
* 修改
* */
router.put('/:id', async (cxt) => {
  const body = cxt.request.body
  const permission = await permissionDao.update({_id: permissionDao.caseObjectId(cxt.params.id)}, body)
  cxt.body = {}
})

router.put('/batch/:ids', async (cxt) => {
  const body = cxt.request.body
  let ids = _.map((cxt.params.ids || '').split(','), (id) => {
    return permissionDao.caseObjectId(id)
  })
  const role = await permissionDao.update({_id: {$in: ids}}, body)
  cxt.body = {}
})


module.exports = router