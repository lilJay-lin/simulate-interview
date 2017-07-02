/**
 * Created by linxiaojie on 2017/6/29.
 */
const BaseDao = require('./base')
const PermissionModel = 'Permission'
class PermissionDao extends BaseDao {
  constructor () {
    super(PermissionModel)
  }
}

module.exports = PermissionDao