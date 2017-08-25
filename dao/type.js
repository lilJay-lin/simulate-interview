/**
 * Created by linxiaojie on 2017/6/29.
 */
const BaseDao = require('./base')
const TypeModel = 'Type'
class TypeDao extends BaseDao {
  constructor () {
    super(TypeModel)
  }
}

module.exports = TypeDao