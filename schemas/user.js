/**
 * Created by linxiaojie on 2016/8/31.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const dbValidate = require('../mongoose/validate')
const crypto = require('crypto')

const UserSchema = new Schema({
  userName: String,
  loginName: String,
  password: String,
  avatar: String,
  introduction: String,
  status: {type: Boolean, default: true},
  email: String,
  salt: String,
  roles: [{type: Schema.Types.ObjectId, ref: 'role'}]
},{timestamps: true})
/*
 * 密码匹配
 * */
const SHA = 'SHA256'
const LITERAL = 2
const LENGTH = 256
UserSchema.methods.comparePassword = function (password) {
  return new Promise((res, rej) => {
    if (!password || !this.password || !this.salt) {
      res(false)
    }
    crypto.pbkdf2(password, this.salt, LITERAL, LENGTH, SHA, (err, key) => {
      if (err) {
        throw err
      }
      res(this.password === key.toString('hex'))
    })
  })
}

/*
 * 数据校验
 * 1. 使用schema的默认校验，校验信息格式在dbHelper.customizeError中定义
 * */
dbValidate.setValidateStrange(UserSchema, {
  password: [
    {
      method: 'required',
      message: '密码不能为空',
    },
    {
      method: 'checkLen',
      min: 6,
      message: '密码长度不能小于6位'
    }
  ],
  loginName: [
    {
      method: 'required',
      message: '登录名不能为空',
    },
    {
      method: 'unique',
      message: '登录名已经存在'
    },
    {
      method: 'match',
      regex: /^[0-9_a-zA-Z]{6,20}$/,
      message: '登录名只能为数字、字母和下划线组成，长度6到20位',
    }
  ],
  email: {
    method: 'match',
    regex: /^\w+(\.\w+)*@\w+(\.\w+)+$/,
    message: '邮箱格式不正确'
  },
  userName:[
    {
      method: 'required',
      message: '用户名不能为空',
    },
    {
      method: 'unique',
      message: '用户名已经存在'
    },
    {
      method: 'checkLen',
      min: 2,
      max: 10,
      message: '用户名称长度2到10位'
    }
  ],
})
/*
 * 保存之前做密码hash加盐
 * */
UserSchema.pre('save', function (next) {
  let user = this
  if (!user.isModified('password')) {
    return next()
  }
  crypto.randomBytes(16, (err, buf) => {
    if (err) {
      return next(err)
    }
    let salt = new Buffer(buf).toString('hex')
    crypto.pbkdf2(user.password, salt, LITERAL, LENGTH, SHA, (err, key) => {
      if (err) {
        return next(err)
      }
      user.salt = salt
      user.password = key.toString('hex')
      next()
    })
  })
})

module.exports = UserSchema