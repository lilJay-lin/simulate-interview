/**
 * Created by linxiaojie on 2016/8/31.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const dbValidate = require('../mongoose/validate')
const moment = require('moment')
const ProductSchema = new Schema({
  type: {type: Schema.Types.ObjectId, ref: 'type'},
  factory: {type: Schema.Types.ObjectId, ref: 'brand'},
  brand: {type: Schema.Types.ObjectId, ref: 'brand'},
  model: String,
  photos: [String],
  description: String,
  status: {type: String, default: '1'}
},{timestamps: true})

if (!ProductSchema.options.toObject) ProductSchema.options.toObject = {};
ProductSchema.options.toObject.transform = (doc, ret, options) => {
  ret.createdAt = moment(ret.createdAt).format("YYYY-MM-DD HH:mm:ss")
  ret.updatedAt = moment(ret.updatedAt).format("YYYY-MM-DD HH:mm:ss")
  return ret
}

dbValidate.setValidateStrange(ProductSchema, {
  type: [
    {
      method: 'required',
      message: '产品类别不能为空'
    }
  ],
  factory: [
    {
      method: 'required',
      message: '品牌不能为空'
    }
  ],
  brand: [
    {
      method: 'required',
      message: '品牌不能为空'
    }
  ],
  model: [
    {
      method: 'required',
      message: '型号不能为空'
    }
  ]
})

module.exports = ProductSchema
