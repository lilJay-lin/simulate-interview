/**
 * Created by linxiaojie on 2017/6/29.
 */
const BaseDao = require('./base')
const RoleModel = 'Role'
class RoleDao extends BaseDao {
  constructor () {
    super(RoleModel)
  }
}

module.exports = RoleDao