/**
 * Created by liljay on 2017/8/17.
 * 权限编码
 * 请求权限验证
 */
const _ = require('lodash')
const error = require('../error/index')
const getCustomError = error.getCustomError
const PERMISSION_FORBID_NAME = error.PERMISSION_FORBID_NAME
module.exports.CODES = code = {
  /* 超级权限 */
  super: "super",
  /* 用户管理 */
  manageUser: "manageUser",
  /* 权限管理 */
  managePermission: "managePermission",
  /* 角色管理 */
  manageRole: "manageRole"
}

const auth = (pers) => {
  return (ctx, next) => {
    let permissions = ctx.state.user.permissions
    let hasPermission = _.some(pers, (permission) => {
      return permissions.indexOf(permission) !== -1
    })
    if (permissions.indexOf(code.super) !== -1 || hasPermission) {
      return next()
    }
    
    throw getCustomError({message: '无权限访问', name: PERMISSION_FORBID_NAME})
  }
}

module.exports.auth = auth