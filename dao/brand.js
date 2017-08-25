/**
 * Created by linxiaojie on 2017/6/29.
 */
const BaseDao = require('./base')
const BrandModel = 'Brand'
class BrandDao extends BaseDao {
  constructor () {
    super(BrandModel)
  }
}

module.exports = BrandDao