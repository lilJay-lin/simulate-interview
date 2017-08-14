/**
 * Created by linxiaojie on 2017/6/29.
 */
const BaseDao = require('./base')
const UserModel = 'User'
const _ = require('lodash')
class UserDao extends BaseDao {
  constructor () {
    super(UserModel)
  }
}

module.exports = UserDao