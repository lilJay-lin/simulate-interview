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
  async pageQuery (param) {
    let pages = await super.pageQuery(param)
    pages.records = _.map(pages.records, (user) => {
      user.password = ''
      user.salt = ''
      return user
    })
    return pages
  }
}

module.exports = UserDao