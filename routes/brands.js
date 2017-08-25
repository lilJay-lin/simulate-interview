/**
 * Created by linxiaojie on 2017/6/13.
 */
const Router = require('koa-router')
const router = new Router()
const BrandDao = require('../dao/brand')
const brandDao = new BrandDao()
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
  let list = await brandDao.pageQuery({pageSize: query.pageSize, page: query.page, queryParam})
  cxt.body = list
})

/*
* 非查询功能权限限制
* */
// router.use(auth([CODES.manageBrand]))

/*
* 增加
* */
router.post('/', async (cxt) => {
  const body = cxt.request.body
  const brand = await brandDao.add(body)
  cxt.body = {}
})

/*
 * 删除
 * */
router.del('/batch/:ids', async (cxt) => {
  const body = cxt.request.body
  let ids = _.map((cxt.params.ids || '').split(','), (id) => {
    return brandDao.caseObjectId(id)
  })
  const brand = await brandDao.batch({_id: {$in: ids}}, body)
  cxt.body = {}
})

/*
* 修改
* */
router.put('/:id', async (cxt) => {
  const body = cxt.request.body
  const brand = await brandDao.update({_id: brandDao.caseObjectId(cxt.params.id)}, body)
  cxt.body = {}
})

router.put('/batch/:ids', async (cxt) => {
  const body = cxt.request.body
  let ids = _.map((cxt.params.ids || '').split(','), (id) => {
    return brandDao.caseObjectId(id)
  })
  const role = await brandDao.update({_id: {$in: ids}}, body)
  cxt.body = {}
})


module.exports = router