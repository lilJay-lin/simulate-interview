/**
 * Created by linxiaojie on 2017/6/29.
 */
const mongoose = require('../mongoose')
const BaseDao = require('./base')
class UserDao {
  static async addUser (doc) {
    const user = mongoose.document(UserDao.UserModel, doc)
    await user.save()
    return user
  }
  static async delUser (cxt) {
    cxt.body = 'delUser'
  }
  static async editUser (cxt) {
    cxt.body = 'editUser'
  }
  static async findUser (queryParam = {}) {
    const User = mongoose.model(UserDao.UserModel)
    let users = await BaseDao.pageQuery(User, {pageSize: 2, queryParam})
    return users
  }
}
UserDao.UserModel = 'User'

module.exports = UserDao