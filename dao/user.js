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
  async getFullUserWithPermission (userId) {
    let users = await this.findPopulate({
      queryParam: {
        _id: this.caseObjectId(userId)
      },
      populate: {
        path: 'roles',
        match: {status: '1'},
        populate: {
          path: 'permissions',
          match: {status: '1'}
        }
      }
    })
    let permissions = []
    let user = users[0].toObject()
    if (user) {
      _.each(user.roles, (role) => {
        _.each(role.permissions, (permission) => {
          permissions.push(permission.code)
        })
      })
    }
    user.permissions = permissions
    return user
  }
}

module.exports = UserDao