/**
 * Created by linxiaojie on 2017/6/13.
 */
const Router = require('koa-router')
const router = new Router()
const TypeDao = require('../dao/type')
const typeDao = new TypeDao()
const getNormalError = require('../error').getNormalError
const _ = require('lodash')
const auth = require('../authorization/req_auth').auth
const CODES = require('../authorization/req_auth').CODES

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
  let list = await typeDao.pageQuery({pageSize: query.pageSize, page: query.page, queryParam})
  cxt.body = list
})

/*
* 非查询功能权限限制
* */
// router.use(auth([CODES.manageType]))

/*
* 增加
* */
router.post('/', async (cxt) => {
  const body = cxt.request.body
  const type = await typeDao.add(body)
  cxt.body = {}
})

/*
 * 删除
 * */
router.del('/batch/:ids', async (cxt) => {
  const body = cxt.request.body
  let ids = _.map((cxt.params.ids || '').split(','), (id) => {
    return typeDao.caseObjectId(id)
  })
  const type = await typeDao.batch({_id: {$in: ids}}, body)
  cxt.body = {}
})

/*
* 修改
* */
router.put('/:id', async (cxt) => {
  const body = cxt.request.body
  const type = await typeDao.update({_id: typeDao.caseObjectId(cxt.params.id)}, body)
  cxt.body = {}
})

router.put('/batch/:ids', async (cxt) => {
  const body = cxt.request.body
  let ids = _.map((cxt.params.ids || '').split(','), (id) => {
    return typeDao.caseObjectId(id)
  })
  const role = await typeDao.update({_id: {$in: ids}}, body)
  cxt.body = {}
})


module.exports = router