/**
 * Created by linxiaojie on 2016/8/31.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema
/*const bcrypt = require('bcryptjs')
const config = require('../config')*/
const dbValidate = require('../mongoose/validate')

const UserSchema = new Schema({
    userName: String,
    loginName: String,
    password: String,
    description: String,
    status: {type: Boolean, default: true},
    email: String,
    roles: [{type: Schema.Types.ObjectId, ref: 'Role'}]
},{timestamps: true})
/*
 * 密码匹配
 * */
/*UserSchema.methods.comparePassword = function (password, cb) {
    if (!password || !this.password) {
        cb(false)
    }

    bcrypt.compare(password, this.password, (err, isMatch) => {
        if (err) {
            return cb(err)
        }
        cb(isMatch)
    })
}*/

/*
 * 数据校验
 * 1. 使用schema的默认校验，校验信息格式在dbHelper.customizeError中定义
 * */
dbValidate.setValidateStrange(UserSchema, {
    password: [
        {
            method: 'required',
            message: '密码不能为空',
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
/*UserSchema.pre('save', function (next) {
    let user = this
    if (!user.isModified('password')) {
        return next()
    }
    bcrypt.genSalt(config.SALT_FACTOR, (err, salt) => {
        if (err) {
            return next(err)
        }
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) {
                return next(err)
            }
            user.password = hash
            next()
        })
    })
})*/

module.exports = UserSchema