/**
 * Created by linxiaojie on 2017/6/29.
 */
const BaseDao = require('./base')
const ProductModel = 'Product'
class ProductDao extends BaseDao {
  constructor () {
    super(ProductModel)
  }
}

module.exports = ProductDao