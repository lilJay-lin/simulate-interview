/**
 * Created by linxiaojie on 2016/8/31.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const dbValidate = require('../mongoose/validate')
const PermissionSchema = new Schema({
    name: String,
    code: String,
    description: String,
    status: {type: String, default: '1'}
},{timestamps: true})

if (!PermissionSchema.options.toObject) PermissionSchema.options.toObject = {};
PermissionSchema.options.toObject.transform = (doc, ret, options) => {
  ret.createdAt = moment(ret.createdAt).format("YYYY-MM-DD HH:mm:ss")
  ret.updatedAt = moment(ret.updatedAt).format("YYYY-MM-DD HH:mm:ss")
  return ret
}

dbValidate.setValidateStrange(PermissionSchema, {
    name: [
        {
            method: 'required',
            message: '权限名称不能为空'
        },
        {
            method: 'checkLen',
            min: 2,
            max: 10,
            message: '权限名称长度2到10位'
        },
        {
            method: 'unique',
            message: '权限名称已经存在'
        }
    ],
    code: [
        {
            method: 'required',
            message: '权限编码不能为空'
        },
        {
            method: 'match',
            regex: /^[0-9a-zA-Z]+$/,
            message: '权限编码只能有数字和字母组成'
        },
        {
            method: 'unique',
            message: '权限编码已经存在'
        }
    ]
})

module.exports = PermissionSchema
