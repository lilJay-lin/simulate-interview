/**
 * Created by linxiaojie on 2016/8/31.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const dbValidate = require('../mongoose/validate')
const moment = require('moment')
const BrandSchema = new Schema({
  name: String,
  description: String,
  status: {type: String, default: '1'}
},{timestamps: true})

if (!BrandSchema.options.toObject) BrandSchema.options.toObject = {};
BrandSchema.options.toObject.transform = (doc, ret, options) => {
  ret.createdAt = moment(ret.createdAt).format("YYYY-MM-DD HH:mm:ss")
  ret.updatedAt = moment(ret.updatedAt).format("YYYY-MM-DD HH:mm:ss")
  return ret
}

dbValidate.setValidateStrange(BrandSchema, {
  name: [
    {
      method: 'required',
      message: '品牌名称不能为空'
    },
    {
      method: 'unique',
      message: '品牌名称已经存在'
    }
  ]
})

module.exports = BrandSchema
