/**
 * Created by liljay on 2016/9/6.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const dbValidate = require('../mongoose/validate')

const RoleSchema = new Schema({
    name: String,
    description: String,
    status: {type: Boolean, default: true},
    permissions: [{type: Schema.Types.ObjectId, ref: 'permission'}]
},{timestamps: true})

/*
* 表校验
* */
dbValidate.setValidateStrange(RoleSchema, {
    name: [
        {
            method: 'required',
            message: '角色名称不能为空'
        },
        {
            method: 'checkLen',
            min: 2,
            max: 10,
            message: '角色名称长度2到10位'
        },
        {
            method: 'unique',
            message: '角色名称已经存在'
        }
    ]
})

module.exports = RoleSchema
