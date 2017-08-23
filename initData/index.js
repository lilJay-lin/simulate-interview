/**
 * Created by liljay on 2017/8/13.
 */
const userDao = new (require('../dao/user'))
const roleDao = new (require('../dao/role'))
const permissionDao = new (require('../dao/permission'))
const CODES = require('../authorization/req_auth').CODES
module.exports = async createBaseData => {
  try{
    let user = await userDao.find({loginName: 'liljay'})
    if (user.length === 0) {
      let permission = await permissionDao.add({
        name: '超级权限',
        code: CODES.super,
        description: '系统超级管理员，拥有全部系统权限'
      })
      let role = await roleDao.add({
        name: '管理员',
        description: '管理员',
        permissions: [permission._id]
      })
      await userDao.add({
        userName: '林小杰',
        loginName: 'liljay',
        password: '8293526@',
        description: '系统管理员',
        email: 'lin_xjie@foxmail.com',
        roles: [role._id]
      })
    }
  } catch (e) {
    console.error(e)
  }
}