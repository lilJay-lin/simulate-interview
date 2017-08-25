/**
 * Created by linxiaojie on 2017/6/13.
 */
const Router = require('koa-router')
const router = new Router()
const ProductDao = require('../dao/product')
const productDao = new ProductDao()
const getNormalError = require('../error').getNormalError
const _ = require('lodash')
const auth = require('../authorization/req_auth').auth
const CODES = require('../authorization/req_auth').CODES

router.param('product', async (id, cxt, next) => {
  const status = cxt.query['status'] == 0 ? 0 : 1
  let products = await productDao.findPopulates({
    queryParam: {
      _id: productDao.caseObjectId(id), status
    },
    populates: [
      {
        path: 'type',
        select: 'name',
        match: {status: '1'}
      },
      {
        path: 'factory',
        select: 'name',
        match: {status: '1'}
      },
      {
        path: 'brand',
        select: 'name',
        match: {status: '1'}
      }
    ]
  })
  if (_.isEmpty(products)) {
    throw getNormalError('权限数据不存在，请检查')
  }
  cxt.product = products[0]
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
  let list = await productDao.pageQuery({pageSize: query.pageSize, page: query.page, queryParam})
  cxt.body = list
})

/*
 * 获取详情
 * */
router.get('/:product', async (cxt) => {
  cxt.body = {
    product: cxt.product
  }
})

/*
* 非查询功能权限限制
* */
// router.use(auth([CODES.manageProduct]))

/*
* 增加
* */
router.post('/', async (cxt) => {
  const body = cxt.request.body
  const product = await productDao.add(body)
  cxt.body = {}
})

/*
 * 删除
 * */
router.del('/batch/:ids', async (cxt) => {
  const body = cxt.request.body
  let ids = _.map((cxt.params.ids || '').split(','), (id) => {
    return productDao.caseObjectId(id)
  })
  const product = await productDao.batch({_id: {$in: ids}}, body)
  cxt.body = {}
})

/*
* 修改
* */
router.put('/:id', async (cxt) => {
  const body = cxt.request.body
  const product = await productDao.update({_id: productDao.caseObjectId(cxt.params.id)}, body)
  cxt.body = {}
})

router.put('/batch/:ids', async (cxt) => {
  const body = cxt.request.body
  let ids = _.map((cxt.params.ids || '').split(','), (id) => {
    return productDao.caseObjectId(id)
  })
  const role = await productDao.update({_id: {$in: ids}}, body)
  cxt.body = {}
})


module.exports = router